import { logInfo } from "../utils/logger";

const context = "all";
const title = "選択＆カスタム検索: ";
let isEnabled = false;

console.log("background script");

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    logInfo("拡張機能がインストールされました", "background");
  } else if (details.reason === "update") {
    logInfo(
      `拡張機能がアップデートされました (v${details.previousVersion ?? "?"} → v${chrome.runtime.getManifest().version})`,
      "background",
    );
  }

  chrome.contextMenus.create({
    title: `${title}${isEnabled ? "OFFにする" : "ONにする"}`,
    contexts: [context],
    id: "Sample",
  });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.isEnabled) {
    isEnabled = Boolean(changes.isEnabled.newValue);
  }
  updateContextMenu();
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "Sample") {
    isEnabled = !isEnabled;
    chrome.storage.local.set({ isEnabled });
    updateContextMenu();
  }
});

function isKeyEnabledMessage(m: unknown): m is { keyEnabled: boolean } {
  return typeof m === "object" && m !== null && "keyEnabled" in m;
}

function isActionMessage(m: unknown): m is { action: string; url?: string } {
  return typeof m === "object" && m !== null && "action" in m;
}

chrome.runtime.onMessage.addListener((message: unknown) => {
  if (isKeyEnabledMessage(message) && Boolean(message.keyEnabled) !== undefined) {
    isEnabled = !isEnabled;
    chrome.storage.local.set({ isEnabled });
    updateContextMenu();
  }
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    chrome.storage.local.get("isEnabled", (data) => {
      isEnabled = data?.isEnabled !== undefined ? Boolean(data.isEnabled) : isEnabled;
      updateContextMenu();
    });
  }
});

function updateContextMenu(): void {
  chrome.contextMenus.remove("Sample", () => {
    if (!chrome.runtime.lastError) {
      chrome.contextMenus.create({
        title: `${title}${isEnabled ? "OFFにする" : "ONにする"}`,
        contexts: [context],
        id: "Sample",
      });
    }
  });
}

chrome.runtime.onMessage.addListener((message: unknown) => {
  if (isActionMessage(message)) {
    if (message.action === "createWindow") {
      chrome.windows.create({ url: message.url });
    } else if (message.action === "createIncognitoWindow") {
      chrome.windows.create({ url: message.url, incognito: true });
    }
  }
});
