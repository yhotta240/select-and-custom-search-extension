// 初期化
let context = 'all';
let title = "選択＆カスタム検索: ";
let isEnabled = false;


// 拡張機能がインストールされたときに実行される処理
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: `${title}${isEnabled ? 'OFFにする' : 'ONにする'}`,
    contexts: [context],
    id: "Sample"
  });
});


// ストレージの値が変更されたときに実行される処理
chrome.storage.onChanged.addListener((changes) => {
  if (changes.isEnabled) {
    isEnabled = changes.isEnabled.newValue;
  }
  updateContextMenu();
});


// コンテキストメニューの項目がクリックされたときに実行される処理
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "Sample") {
    isEnabled = !isEnabled;
    // console.log(`現在の状態: ${isEnabled ? 'ON' : 'OFF'}`);
    chrome.storage.local.set({ isEnabled: isEnabled });

    updateContextMenu();
  }
});


// メッセージを受信したときに実行される処理
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.keyEnabled) {
    isEnabled = !isEnabled;
    // console.log(`現在の状態: ${isEnabled ? 'ON' : 'OFF'}`);
    chrome.storage.local.set({ isEnabled: isEnabled });
    updateContextMenu();
  }
});


// タブが更新されたときに実行される処理
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    // ストレージから'isEnabled'の値を取得
    chrome.storage.local.get('isEnabled', (data) => {
      isEnabled = data.isEnabled !== undefined ? data.isEnabled : isEnabled;

      // ページがリロードされたことをログに出力（デバッグ用）
      // console.log("ページがリロードされました。", `現在の状態: ${isEnabled ? 'ON' : 'OFF'}`);

      updateContextMenu();
    });
  }
});


// コンテキストメニューを更新する関数
function updateContextMenu() {
  chrome.contextMenus.remove("Sample", () => {
    if (!chrome.runtime.lastError) {
      chrome.contextMenus.create({
        title: `${title}${isEnabled ? 'OFFにする' : 'ONにする'}`,
        contexts: [context],
        id: "Sample"
      });
    }
  });
}

