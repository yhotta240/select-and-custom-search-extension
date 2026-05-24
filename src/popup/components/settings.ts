import Sortable from "sortablejs";
import { getStorage, setStorage } from "../../utils/storage";
import type { Site } from "../types";

function qs<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

function normalize(value: unknown): string {
  return value == null || value === "undefined" ? "" : String(value);
}

const defaultSites: Site[] = [
  {
    name: "google.com",
    url: "https://google.com",
    searchQuery: "/search?q=",
    urlSuffix: "",
    isVisible: true,
  },
  {
    name: "www.youtube.com",
    url: "https://www.youtube.com",
    searchQuery: "/results?search_query=",
    urlSuffix: "",
    isVisible: true,
  },
  {
    name: "x.com",
    url: "https://x.com",
    searchQuery: "/search?q=",
    urlSuffix: "",
    isVisible: true,
  },
  {
    name: "www.amazon.co.jp",
    url: "https://www.amazon.co.jp",
    searchQuery: "/s?k=",
    urlSuffix: "",
    isVisible: true,
  },
  {
    name: "search.rakuten.co.jp",
    url: "https://search.rakuten.co.jp",
    searchQuery: "/search/mall/",
    urlSuffix: "",
    isVisible: true,
  },
  {
    name: "chatgpt.com",
    url: "https://chatgpt.com",
    searchQuery: "/search?q=",
    urlSuffix: "",
    isVisible: true,
  },
  {
    name: "www.perplexity.com",
    url: "https://www.perplexity.com",
    searchQuery: "/search/new?q=",
    urlSuffix: "",
    isVisible: true,
  },
  {
    name: "open.spotify.com",
    url: "https://open.spotify.com",
    searchQuery: "/search/",
    urlSuffix: "",
    isVisible: true,
  },
  {
    name: "www.pixiv.net",
    url: "https://www.pixiv.net",
    searchQuery: "/search?q=",
    urlSuffix: "",
    isVisible: true,
  },
  {
    name: "github.com",
    url: "https://github.com",
    searchQuery: "/search?q=",
    urlSuffix: "",
    isVisible: true,
  },
  {
    name: "www.deepl.com",
    url: "https://www.deepl.com",
    searchQuery: "/#en/ja/",
    urlSuffix: "",
    isVisible: true,
  },
  {
    name: "ja.wikipedia.org",
    url: "https://ja.wikipedia.org",
    searchQuery: "/wiki/",
    urlSuffix: "",
    isVisible: true,
  },
  {
    name: "store.steampowered.com",
    url: "https://store.steampowered.com",
    searchQuery: "/search/?term=",
    urlSuffix: "",
    isVisible: true,
  },
  {
    name: "www.cmoa.jp",
    url: "https://www.cmoa.jp",
    searchQuery: "/search/result/?header_word=",
    urlSuffix: "",
    isVisible: true,
  },
];

const THEME_ICONS: Record<string, string> = {
  light: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brightness-high-fill" viewBox="0 0 16 16"><path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/></svg>`,
  dark: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon-stars-fill" viewBox="0 0 16 16"><path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/><path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/></svg>`,
};

let sortableInstance: Sortable | null = null;

async function customSearchPreview(): Promise<void> {
  const data = await getStorage<{
    sites?: Site[];
    iconNum?: number;
    theme?: string;
    isExpanded?: boolean;
  }>(["sites", "iconNum", "theme", "isExpanded"]);

  const sites = data.sites ?? defaultSites;
  const iconNum = Number(data.iconNum ?? 8);
  const theme = data.theme ?? "light";
  const isExpanded = Boolean(data.isExpanded);

  const changeTheme = qs<HTMLInputElement>("change-theme");
  const changeThemeIcon = qs<HTMLElement>("change-theme-icon");

  if (changeTheme) changeTheme.checked = theme === "dark";
  if (changeThemeIcon) changeThemeIcon.innerHTML = THEME_ICONS[theme] ?? THEME_ICONS.light;

  const gap = 2;
  const groupPadding = 6;
  const padding = 4;
  const buttonWidth = 20;
  const maxWidth = iconNum * (buttonWidth + padding * 2 + gap) - gap + groupPadding * 2;

  const selBoxElement = document.createElement("div");
  selBoxElement.className = "my-extension-root sel-box-element";
  Object.assign(selBoxElement.style, { maxWidth: `${maxWidth}px`, zIndex: "0" });

  const selBoxGroup = document.createElement("div");
  selBoxGroup.className = "btn-group1 my-extension-root flex-wrap1 w-100";
  selBoxGroup.style.height = isExpanded ? `${20 + padding * 2 + gap + groupPadding}px` : "auto";
  selBoxGroup.style.backgroundColor = theme === "light" ? "#ffffff" : "#292e33";
  selBoxGroup.setAttribute("role", "group");
  selBoxGroup.setAttribute("aria-label", "search-box");
  selBoxGroup.id = "search-box";

  await setStorage({ sites });

  sites.forEach((site, index) => {
    if (index >= iconNum - 1 && isExpanded) return;
    if (site.isVisible === false) return;

    const selBox = document.createElement("a");
    const iconUrl = getFaviconUrl(site.url);
    selBox.href = site.url;
    selBox.id = site.name;
    selBox.title = site.name;
    selBox.target = "_blank";
    selBox.className = `btn1 btn-icon1 m-auto1 ${theme === "light" ? "btn-light1" : "btn-dark1"}`;
    selBox.innerHTML = `<img src="${iconUrl}" alt="icon" style="width:20px; height:20px;">`;
    selBoxGroup.append(selBox);
  });

  const offBtn = document.createElement("button");
  offBtn.className = `btn1 selBoxGroup btn-icon1 ${theme === "light" ? "btn-light1" : "btn-dark1"}`;
  offBtn.style.width = "28px";
  offBtn.id = "off-button";
  offBtn.title = "ツールをOFFにする";
  offBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban" viewBox="0 0 16 16"><path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/></svg>`;
  selBoxGroup.append(offBtn);

  const expandBtn = document.createElement("button");
  expandBtn.className = `expand-btn btn-sm rounded-bottom ${theme === "light" ? "btn-light1" : "btn-dark1"} w-100 p-0 m-0`;
  expandBtn.id = "expand-button";
  const expandIconExpand = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-compact-down" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.553 6.776a.5.5 0 0 1 .67-.223L8 9.44l5.776-2.888a.5.5 0 1 1 .448.894l-6 3a.5.5 0 0 1-.448 0l-6-3a.5.5 0 0 1-.223-.67"/></svg>`;
  const expandIconCollapse = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-compact-up" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M7.776 5.553a.5.5 0 0 1 .448 0l6 3a.5.5 0 1 1-.448.894L8 6.56 2.224 9.447a.5.5 0 1 1-.448-.894z"/></svg>`;
  expandBtn.innerHTML = isExpanded ? expandIconExpand : expandIconCollapse;

  selBoxElement.innerHTML = selBoxGroup.outerHTML + expandBtn.outerHTML;

  const previewElement = qs<HTMLDivElement>("settings-preview");
  if (previewElement) previewElement.innerHTML = selBoxElement.outerHTML;

  listSites();
}

const SORTABLE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/></svg>`;
const VISIBLE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/></svg>`;
const HIDDEN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588M5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/></svg>`;
const DELETE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16"><path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/></svg>`;

async function listSites(): Promise<void> {
  const data = await getStorage<{ sites?: Site[] }>("sites");
  const sites = data.sites ?? [];

  const siteQueryListBody = qs<HTMLTableSectionElement>("site-query-list-body");
  if (!siteQueryListBody) return;
  siteQueryListBody.innerHTML = "";

  sites.forEach((site, index) => {
    const iconUrl = getFaviconUrl(site.url);
    const isVisible = site.isVisible !== false;
    const urlSuffix = normalize(site.urlSuffix);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="text-center sortable-list-td bg-outline-secondary d-none" style="cursor: grab;">${SORTABLE_ICON}</td>
      <td class="text-center action-list-td d-none">
        <button class="btn btn-sm p-0 btn-outline-secondary visible-list-btn d-none ${!isVisible ? "icon-is-hidden" : ""}" data-index="${index}">${isVisible ? VISIBLE_ICON : HIDDEN_ICON}</button>
        <button class="btn btn-sm p-0 btn-outline-secondary delete-list-btn d-none ${!isVisible ? "icon-is-hidden" : ""}">${DELETE_ICON}</button>
      </td>
      <td class="text-center"><img src="${iconUrl}" alt="アイコン" style="width:15px; height:15px;"></td>
      <td class="text-nowrap">${site.name}</td>
      <td class="text-nowrap">${site.url}</td>
      <td class="text-nowrap">${site.searchQuery ?? ""}</td>
      <td class="text-nowrap">${urlSuffix}</td>
      <td class="text-nowrap d-none">${site.inputForm ?? ""}</td>
      <td class="text-nowrap d-none">${site.inputButton ?? ""}</td>
    `;
    if (!isVisible) {
      row.querySelectorAll("td").forEach((td) => {
        td.classList.add("bg-secondary");
      });
    }
    siteQueryListBody.appendChild(row);
  });

  const sortableButton = qs<HTMLInputElement>("sortable-btn-outlined");
  const editButton = qs<HTMLInputElement>("edit-btn-outlined");
  const visibleButton = qs<HTMLInputElement>("visible-btn-outlined");
  const deleteButton = qs<HTMLInputElement>("delete-btn-outlined");

  if (sortableInstance) sortableInstance.destroy();
  sortableInstance = new Sortable(siteQueryListBody, {
    handle: ".sortable-list-td",
    animation: 150,
    ghostClass: "sortable-ghost",
    disabled: !(sortableButton?.checked ?? false),
    onEnd: async (evt) => {
      const d = await getStorage<{ sites?: Site[] }>("sites");
      const currentSites = d.sites ?? [];
      const [movedItem] = currentSites.splice(evt.oldIndex ?? 0, 1);
      currentSites.splice(evt.newIndex ?? 0, 0, movedItem);
      await setStorage({ sites: currentSites });
      await customSearchPreview();
    },
  });

  toggleSortableState(sortableButton?.checked ?? false);
  toggleEditMode(editButton?.checked ?? false, false);
  toggleVisibleState(visibleButton?.checked ?? false, deleteButton?.checked ?? false);
  toggleDeleteVisibility(deleteButton?.checked ?? false, visibleButton?.checked ?? false);
}

function toggleSortableState(checked: boolean): void {
  document.querySelectorAll<HTMLElement>(".sortable-list-td").forEach((el) => {
    el.classList.toggle("d-none", !checked);
  });
  if (sortableInstance) sortableInstance.option("disabled", !checked);
  qs<HTMLElement>("site-query-list")?.classList.toggle("sorting-enabled", checked);
}

function toggleEditMode(isEditing: boolean, shouldSave: boolean): void {
  const siteQueryListBody = qs<HTMLTableSectionElement>("site-query-list-body");
  if (!siteQueryListBody) return;
  const rows = siteQueryListBody.querySelectorAll<HTMLTableRowElement>("tr");

  if (isEditing) {
    rows.forEach((row) => {
      for (let i = 3; i <= 6; i++) {
        const cell = row.cells[i];
        if (!cell) continue;
        const originalText = cell.textContent ?? "";
        cell.innerHTML = `<input type="text" class="form-control form-control-sm" value="${originalText}">`;
      }
    });
  } else {
    if (shouldSave && siteQueryListBody.querySelector('input[type="text"]')) {
      getStorage<{ sites?: Site[] }>("sites").then((d) => {
        const sites = d.sites ?? [];
        rows.forEach((row, index) => {
          if (!sites[index]) return;
          const nameInput = row.cells[3]?.querySelector<HTMLInputElement>("input");
          const urlInput = row.cells[4]?.querySelector<HTMLInputElement>("input");
          const queryInput = row.cells[5]?.querySelector<HTMLInputElement>("input");
          const urlSuffixInput = row.cells[6]?.querySelector<HTMLInputElement>("input");
          if (nameInput && urlInput && queryInput) {
            sites[index].name = nameInput.value;
            sites[index].url = urlInput.value;
            sites[index].searchQuery = queryInput.value;
            if (urlSuffixInput) sites[index].urlSuffix = urlSuffixInput.value;
          }
        });
        setStorage({ sites }).then(() => customSearchPreview());
      });
    } else {
      rows.forEach((row) => {
        for (let i = 3; i <= 6; i++) {
          const cell = row.cells[i];
          if (!cell) continue;
          const input = cell.querySelector<HTMLInputElement>("input");
          if (input) cell.innerHTML = input.value;
        }
      });
    }
  }
}

function toggleVisibleState(isVisible: boolean, isDeleteChecked: boolean): void {
  document.querySelectorAll<HTMLElement>(".action-list-td").forEach((el) => {
    el.classList.toggle("d-none", !isVisible && !isDeleteChecked);
    el.querySelector<HTMLElement>(".visible-list-btn")?.classList.toggle("d-none", !isVisible);
  });
}

function toggleDeleteVisibility(isChecked: boolean, isVisibleChecked: boolean): void {
  document.querySelectorAll<HTMLElement>(".action-list-td").forEach((el) => {
    el.classList.toggle("d-none", !isChecked && !isVisibleChecked);
    el.querySelector<HTMLElement>(".delete-list-btn")?.classList.toggle("d-none", !isChecked);
  });
}

function showAlertInfo(checked: boolean, message: string): void {
  const alertInfo = qs<HTMLElement>("alert-info");
  alertInfo?.classList.toggle("d-none", !checked);
  const alertText = qs<HTMLElement>("alert-info-text");
  if (alertText) alertText.textContent = message;
}

export async function setupSettingsTab(): Promise<void> {
  const data = await getStorage<{
    isIconWrap?: boolean;
    iconNum?: number;
    searchMode?: string;
    selectPosition?: string;
    textDistance?: number;
  }>(["isIconWrap", "iconNum", "searchMode", "selectPosition", "textDistance"]);

  const iconWrap = qs<HTMLInputElement>("icon-wrap");
  const iconNumRange = qs<HTMLInputElement>("icon-num-range");
  const iconNumText = qs<HTMLElement>("icon-num-text");
  const searchMode = qs<HTMLSelectElement>("search-mode");
  const selectPosition = qs<HTMLSelectElement>("select-position");
  const selectTextDistance = qs<HTMLInputElement>("select-text-distance");
  const selectTextDistanceLabel = qs<HTMLElement>("select-text-distance-label");

  if (iconWrap) iconWrap.checked = Boolean(data.isIconWrap ?? false);
  if (iconNumRange) {
    const n = Number(data.iconNum ?? 8);
    iconNumRange.value = String(n);
    if (iconNumText) iconNumText.textContent = String(n);
  }
  if (searchMode) searchMode.value = String(data.searchMode ?? "new-tab");
  if (selectPosition) selectPosition.value = String(data.selectPosition ?? "default");
  if (selectTextDistance) {
    const d = Number(data.textDistance ?? 6);
    selectTextDistance.value = String(d);
    if (selectTextDistanceLabel) selectTextDistanceLabel.textContent = String(d);
    const distWrapper = qs<HTMLElement>("search-box-distance");
    if (distWrapper) distWrapper.classList.toggle("d-none", selectPosition?.value !== "default");
  }

  iconWrap?.addEventListener("change", (e) => {
    const v = (e.target as HTMLInputElement).checked;
    setStorage({ isIconWrap: v });
    customSearchPreview();
  });

  iconNumRange?.addEventListener("input", (e) => {
    const v = Number((e.target as HTMLInputElement).value || 8);
    if (iconNumText) iconNumText.textContent = String(v);
    setStorage({ iconNum: v });
    customSearchPreview();
  });

  searchMode?.addEventListener("change", (e) => {
    setStorage({ searchMode: (e.target as HTMLSelectElement).value });
  });

  selectPosition?.addEventListener("change", (e) => {
    const val = (e.target as HTMLSelectElement).value;
    setStorage({ selectPosition: val });
    const distWrapper = qs<HTMLElement>("search-box-distance");
    if (distWrapper) distWrapper.classList.toggle("d-none", val !== "default");
  });

  selectTextDistance?.addEventListener("input", (e) => {
    const v = Number((e.target as HTMLInputElement).value || 0);
    if (selectTextDistanceLabel) selectTextDistanceLabel.textContent = String(v);
    setStorage({ textDistance: v });
  });

  const changeThemeIcon = qs<HTMLElement>("change-theme-icon");
  changeThemeIcon?.addEventListener("click", async () => {
    const d = await getStorage<{ theme?: string }>("theme");
    const newTheme = d.theme === "light" ? "dark" : "light";
    await setStorage({ theme: newTheme });
    await customSearchPreview();
  });

  document.addEventListener("click", async (event) => {
    if ((event.target as HTMLElement).closest("#expand-button")) {
      const d = await getStorage<{ isExpanded?: boolean }>("isExpanded");
      await setStorage({ isExpanded: !d.isExpanded });
      await customSearchPreview();
    }
  });

  const sortableButton = qs<HTMLInputElement>("sortable-btn-outlined");
  const editButton = qs<HTMLInputElement>("edit-btn-outlined");
  const visibleButton = qs<HTMLInputElement>("visible-btn-outlined");
  const deleteButton = qs<HTMLInputElement>("delete-btn-outlined");

  sortableButton?.addEventListener("change", (e) => {
    const isChecked = (e.target as HTMLInputElement).checked;
    showAlertInfo(
      isChecked,
      "並び替え: ドラッグで登録サイトリストの順番を入れ替えると，「検索先ボックス」の表示順序も同期して更新されます．",
    );
    toggleSortableState(isChecked);
    if (isChecked) {
      if (editButton) {
        editButton.checked = false;
        toggleEditMode(false, false);
      }
      if (visibleButton) {
        visibleButton.checked = false;
        toggleVisibleState(false, false);
      }
      if (deleteButton) {
        deleteButton.checked = false;
        toggleDeleteVisibility(false, false);
      }
    }
  });

  editButton?.addEventListener("change", (e) => {
    const isChecked = (e.target as HTMLInputElement).checked;
    showAlertInfo(
      isChecked,
      "編集: 各項目を編集し，再度「編集」ボタンを押すと変更が保存されます．",
    );
    toggleEditMode(isChecked, true);
    if (isChecked) {
      if (sortableButton) {
        sortableButton.checked = false;
        toggleSortableState(false);
      }
      if (visibleButton) {
        visibleButton.checked = false;
        toggleVisibleState(false, deleteButton?.checked ?? false);
      }
      if (deleteButton) {
        deleteButton.checked = false;
        toggleDeleteVisibility(false, visibleButton?.checked ?? false);
      }
    }
  });

  visibleButton?.addEventListener("change", (e) => {
    const isChecked = (e.target as HTMLInputElement).checked;
    showAlertInfo(isChecked, "表示: 表示/非表示を切り替えます.");
    toggleVisibleState(isChecked, deleteButton?.checked ?? false);
    if (isChecked) {
      if (editButton) {
        editButton.checked = false;
        toggleEditMode(false, false);
      }
      if (sortableButton) {
        sortableButton.checked = false;
        toggleSortableState(false);
      }
      if (deleteButton) {
        deleteButton.checked = false;
        toggleDeleteVisibility(false, isChecked);
      }
    }
  });

  deleteButton?.addEventListener("change", (e) => {
    const isChecked = (e.target as HTMLInputElement).checked;
    showAlertInfo(
      isChecked,
      "削除: ゴミ箱アイコンをクリックすると，そのサイトがリストから削除されます．",
    );
    toggleDeleteVisibility(isChecked, visibleButton?.checked ?? false);
    if (isChecked) {
      if (editButton) {
        editButton.checked = false;
        toggleEditMode(false, false);
      }
      if (sortableButton) {
        sortableButton.checked = false;
        toggleSortableState(false);
      }
      if (visibleButton) {
        visibleButton.checked = false;
        toggleVisibleState(false, isChecked);
      }
    }
  });

  const siteQueryListTable = qs<HTMLElement>("site-query-list");
  siteQueryListTable?.addEventListener("click", async (e) => {
    const visibleBtn = (e.target as HTMLElement).closest<HTMLElement>(".visible-list-btn");
    if (visibleBtn) {
      const index = Number.parseInt(visibleBtn.dataset.index ?? "0", 10);
      const d = await getStorage<{ sites?: Site[] }>("sites");
      const sites = d.sites ?? [];
      if (sites[index]) {
        sites[index].isVisible = !(sites[index].isVisible !== false);
        await setStorage({ sites });
        await customSearchPreview();
      }
    }
  });

  const siteQueryListBody = qs<HTMLTableSectionElement>("site-query-list-body");
  siteQueryListBody?.addEventListener("click", async (e) => {
    if ((e.target as HTMLElement).closest(".delete-list-btn")) {
      const buttons = siteQueryListBody.querySelectorAll(".delete-list-btn");
      const deleteIndex = Array.from(buttons).indexOf(
        (e.target as HTMLElement).closest(".delete-list-btn") as Element,
      );
      const d = await getStorage<{ sites?: Site[] }>("sites");
      const sites = d.sites ?? [];
      const updatedSites = sites.filter((_, i) => i !== deleteIndex);
      await setStorage({ sites: updatedSites });
      await customSearchPreview();
    }
  });

  setupUrlRegistrationForm();

  const clearButton = qs<HTMLButtonElement>("btn-close");
  const searchUrlInput = qs<HTMLInputElement>("searchUrl");
  clearButton?.addEventListener("click", () => {
    if (searchUrlInput) searchUrlInput.value = "";
  });

  const newTabButton = qs<HTMLButtonElement>("new-tab-button");
  newTabButton?.addEventListener("click", () => {
    chrome.tabs.create({ url: "popup/popup.html" });
  });

  await customSearchPreview();
}

function setupUrlRegistrationForm(): void {
  const searchUrl = qs<HTMLInputElement>("searchUrl");

  function handleSearchUrlInput(e: Event): void {
    const text = (e.target as HTMLInputElement).value;
    if (searchUrl) {
      searchUrl.type = "text";
      searchUrl.value = decodeURIComponent(text);
      setTimeout(() => {
        if (searchUrl) searchUrl.type = "url";
      }, 0);
    }
  }

  searchUrl?.addEventListener("change", handleSearchUrlInput);
  searchUrl?.addEventListener("input", handleSearchUrlInput);

  const urlForm = qs<HTMLFormElement>("urlForm");
  urlForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const resultSection = qs<HTMLElement>("resultSection");
    const registerButton = qs<HTMLButtonElement>("registerButton");
    const searchType = qs<HTMLElement>("searchType");
    const paramSection = qs<HTMLElement>("paramSection");
    const paramSelect = qs<HTMLSelectElement>("paramSelect");
    const templateSection = qs<HTMLElement>("templateSection");
    const selectLabel = qs<HTMLElement>("select-label");
    const overwriteSection = qs<HTMLElement>("overwrite-confirm-section");
    const overwriteCheckbox = qs<HTMLInputElement>("overwrite-confirm-checkbox");

    if (
      !searchUrl ||
      !resultSection ||
      !registerButton ||
      !searchType ||
      !paramSection ||
      !paramSelect ||
      !templateSection ||
      !selectLabel ||
      !overwriteSection ||
      !overwriteCheckbox
    )
      return;

    overwriteSection.classList.add("d-none");
    overwriteCheckbox.checked = false;
    paramSelect.innerHTML = "";
    templateSection.classList.add("d-none");

    let url: URL;
    try {
      url = new URL(searchUrl.value);
    } catch {
      return;
    }

    const d = await getStorage<{ sites?: Site[] }>("sites");
    const sites = d.sites ?? [];
    const name = url.hostname;
    const siteIndex = sites.findIndex((site) => site.name === name);
    if (siteIndex !== -1) {
      const overwriteConfirmLabel = qs<HTMLElement>("overwrite-confirm-label");
      if (overwriteConfirmLabel) {
        overwriteConfirmLabel.textContent = `${name} は既に存在します．上書き保存する場合はチェックを入れてください．最新に追加された同名サイト（登録サイトリストの下の方）が上書き対象となります．`;
      }
      overwriteSection.classList.remove("d-none");
    }

    const params = url.searchParams;
    if (params.toString()) {
      searchType.textContent = "クエリパラメータ検索";
      for (const [key, value] of params) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = `${key}=${decodeURIComponent(value)}`;
        paramSelect.appendChild(option);
      }
      paramSection.classList.remove("d-none");
    } else if (url.hash) {
      searchType.textContent = "フラグメント型検索";
      selectLabel.textContent = "検索したキーワードを選択してください:";
      const hashParts = url.hash.split("/").filter((part) => part !== "");
      if (hashParts.length > 0) {
        hashParts.forEach((part, index) => {
          const option = document.createElement("option");
          option.value = index === 0 ? `#${part}` : part;
          option.textContent = decodeURIComponent(part);
          paramSelect.appendChild(option);
        });
        paramSection.classList.remove("d-none");
      }
    } else {
      searchType.textContent = "パス型検索";
      selectLabel.textContent = "検索したキーワードを選択してください:";
      const pathParts = url.pathname.split("/").filter((part) => part !== "");
      if (pathParts.length > 0) {
        pathParts.forEach((part) => {
          const decoded = decodeURIComponent(part);
          const option = document.createElement("option");
          option.value = decoded;
          option.textContent = decoded;
          paramSelect.appendChild(option);
        });
        paramSection.classList.remove("d-none");
      }
    }

    resultSection.classList.remove("d-none");
    registerButton.classList.remove("d-none");

    const newRegisterButton = registerButton.cloneNode(true) as HTMLButtonElement;
    registerButton.parentNode?.replaceChild(newRegisterButton, registerButton);

    newRegisterButton.addEventListener("click", async () => {
      const searchTypeText = searchType.textContent ?? "";
      let searchQuery: string;

      if (searchTypeText === "クエリパラメータ検索") {
        const selectedParam = paramSelect.value;
        const template = `${url.origin}${url.pathname}?${selectedParam}={query}`;
        searchQuery = `${url.pathname}?${selectedParam}=`;
        const searchTemplate = qs<HTMLElement>("searchTemplate");
        if (searchTemplate) searchTemplate.textContent = template;
      } else if (searchTypeText === "フラグメント型検索") {
        const selectedKeyword = paramSelect.value;
        const basePath = url.hash.split(selectedKeyword)[0];
        const template = `${url.origin}/${basePath}{keyword}`;
        searchQuery = `/${basePath}`;
        const searchTemplate = qs<HTMLElement>("searchTemplate");
        if (searchTemplate) searchTemplate.textContent = template;
      } else {
        const selectedKeyword = encodeURIComponent(paramSelect.value);
        const basePath = url.pathname.split(selectedKeyword)[0];
        const template = `${url.origin}${basePath}{keyword}`;
        searchQuery = basePath;
        const searchTemplate = qs<HTMLElement>("searchTemplate");
        if (searchTemplate) searchTemplate.textContent = template;
      }

      templateSection.classList.remove("d-none");

      const d2 = await getStorage<{ sites?: Site[] }>("sites");
      const currentSites = d2.sites ?? [];

      let lastSiteIndex = -1;
      for (let i = currentSites.length - 1; i >= 0; i--) {
        if (currentSites[i].name === name) {
          lastSiteIndex = i;
          break;
        }
      }

      if (lastSiteIndex !== -1) {
        const shouldOverwrite = overwriteCheckbox.checked;
        if (shouldOverwrite) {
          currentSites[lastSiteIndex] = { name, url: url.origin, searchQuery };
        } else {
          currentSites.push({ name, url: url.origin, searchQuery });
        }
      } else {
        currentSites.push({ name, url: url.origin, searchQuery });
      }

      await setStorage({ sites: currentSites });
      await customSearchPreview();
      newRegisterButton.classList.add("d-none");
    });
  });
}

export default setupSettingsTab;
