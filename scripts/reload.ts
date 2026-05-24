const DEV_SERVER_URL = "ws://localhost:6571";

/**
 * 開発用オートリロード機能を初期化
 */
export function reloadExtension(): void {
  try {
    const ws = new WebSocket(DEV_SERVER_URL);

    ws.onmessage = () => {
      console.log("拡張機能のオートリロードが実行されました");
      chrome.runtime.reload();
    };

    ws.onerror = (error) => {
      console.warn("開発用 WebSocket 接続に失敗しました:", error);
    };

    ws.onclose = () => {
      console.log("開発用 WebSocket 接続が閉じられました");
    };
  } catch (error) {
    console.warn("開発用 WebSocket の初期化に失敗しました:", error);
  }
}