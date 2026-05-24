// 開発専用の webpack プラグイン
// ビルド後に接続中のクライアントへ WebSocket 経由で "reload" を送信し，拡張機能を自動で再読み込みする
let WebSocket
try {
  WebSocket = require("ws")
} catch (err) {
  // `ws` がインストールされていない場合や本番環境ではリローダーを無効化する
  WebSocket = null
  console.warn("ext-reloader: 'ws' モジュールが見つかりません — リローダーを無効化します．")
}

// 開発専用の webpack プラグイン
// - ポート競合へのフォールバック（既に同ポートでサーバが存在する場合は再利用する）
// - webpack の watch が止まった際にサーバをクリーンに close する
class ExtensionReloader {
  constructor(port = 6571) {
    this.port = port
    this._ownsServer = false

    if (!WebSocket) {
      this.wss = { clients: [] }
      return
    }

    // グローバルに既存のサーバ参照を保持しておき、複数インスタンスでポート競合しないようにする
    // 他の webpack プラグインインスタンスが同一プロセス内で既にサーバを持っている場合はそれを再利用する
    if (global.__EXT_RELOADER_WSS && global.__EXT_RELOADER_WSS.port === this.port) {
      this.wss = global.__EXT_RELOADER_WSS.instance
      this._ownsServer = false
    } else {
      try {
        this.wss = new WebSocket.Server({ port: this.port })
        // 所有権を示すフラグとグローバル参照を保持
        this._ownsServer = true
        global.__EXT_RELOADER_WSS = { instance: this.wss, port: this.port }
        this.wss.on("error", (err) => {
          // EADDRINUSE 等のエラーが来る可能性がある — ログに残す
          console.warn(`ext-reloader: WebSocket server error on port ${this.port}:`, err && err.code ? err.code : err)
        })
      } catch (err) {
        // ポート使用中などでサーバを作れない場合は安全にフォールバック
        console.warn(`ext-reloader: WebSocket サーバの作成に失敗しました（ポート ${this.port}）:`, err && err.code ? err.code : err)
        this.wss = { clients: [] }
        this._ownsServer = false
      }
    }
  }

  apply(compiler) {
    // ビルド後に接続中クライアントへ reload を送る
    compiler.hooks.afterEmit.tap("ExtensionReloader", () => {
      for (const client of this.wss.clients) {
        try {
          if (WebSocket && client.readyState === WebSocket.OPEN) {
            client.send("reload")
          }
        } catch (e) {
          // 個々のクライアント送信エラーは無視
        }
      }
    })

    // watch モードが終了したらサーバを閉じる（自分が作成した場合のみ）
    if (compiler.hooks && compiler.hooks.watchClose) {
      compiler.hooks.watchClose.tap("ExtensionReloader", () => {
        this._closeServer()
      })
    }

    // webpack のプロセス終了時にもクリーンアップ
    if (this._ownsServer) {
      const cleanup = () => this._closeServer()
      process.on("exit", cleanup)
      process.on("SIGINT", () => {
        cleanup()
        process.exit()
      })
      process.on("SIGTERM", () => {
        cleanup()
        process.exit()
      })
    }
  }

  _closeServer() {
    if (!this._ownsServer) return
    try {
      if (this.wss && typeof this.wss.close === "function") {
        this.wss.close(() => {
          // global に保持している参照をクリア
          if (global.__EXT_RELOADER_WSS && global.__EXT_RELOADER_WSS.instance === this.wss) {
            delete global.__EXT_RELOADER_WSS
          }
        })
      }
    } catch (err) {
      // close に失敗しても開発中のみの処理なのでログを残すに留める
      console.warn("ext-reloader: WebSocket server の close に失敗しました:", err)
    }
  }
}

module.exports = ExtensionReloader
