import { windowOnload } from "./search-runner";
import { customSearch } from "./search-ui";

let isEnabled = false;
const _manifestData = chrome.runtime.getManifest();

const handleTool = (enable: boolean): void => {
  if (enable) {
    document.addEventListener("mouseup", eventHandler);
    windowOnload();
  } else {
    document.removeEventListener("mouseup", eventHandler);
  }
};

chrome.storage.local.get(
  ["settings", "isEnabled", "selectedText"],
  (data: Record<string, unknown>) => {
    isEnabled = data.isEnabled !== undefined ? Boolean(data.isEnabled) : isEnabled;
    handleTool(isEnabled);
  },
);

document.addEventListener("keydown", (e) => {
  if (e.key === "q" && e.ctrlKey && !e.shiftKey && !e.altKey) {
    chrome.storage.local.get(["settings", "isEnabled"], (data: Record<string, unknown>) => {
      isEnabled = !data.isEnabled;
      chrome.storage.local.set({ settings: data.settings, isEnabled });
      handleTool(isEnabled);
    });
  }
});

chrome.storage.onChanged.addListener((changes) => {
  isEnabled = changes.isEnabled ? Boolean(changes.isEnabled.newValue) : isEnabled;
  handleTool(isEnabled);
});

function eventHandler(): void {
  customSearch();
}
