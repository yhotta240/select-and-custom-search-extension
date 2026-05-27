import { DEFAULT_SETTINGS, type Settings } from "../settings";

export async function getSettings(): Promise<Settings> {
  const data = await getStorage<Settings>([
    "sites",
    "selectPosition",
    "textDistance",
    "theme",
    "iconNum",
    "searchMode",
    "isExpanded",
    "isIconWrap",
  ]);
  return { ...DEFAULT_SETTINGS, ...data };
}

export async function isEnabled(): Promise<boolean> {
  const data = await getStorage<{ isEnabled?: boolean }>("isEnabled");
  return data.isEnabled === true;
}

export async function setSettings(settings: Settings): Promise<void> {
  await setStorage(settings);
}

export async function setEnabled(enabled: boolean): Promise<void> {
  await setStorage({ isEnabled: enabled });
}

export function getStorage<T extends Record<string, unknown>>(
  keys: string | string[],
): Promise<Partial<T>> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve((result ?? {}) as Partial<T>);
    });
  });
}

export function setStorage<T extends Record<string, unknown>>(items: T): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}
