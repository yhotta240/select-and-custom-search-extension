import Sortable from "sortablejs";
import "../../content/content.css";
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
    searchQuery: "/?prompt=",
    urlSuffix: "",
    isVisible: true,
  },
  {
    name: "claude.ai",
    url: "https://claude.ai",
    searchQuery: "/new?q=",
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
  light: `<i class="bi bi-brightness-high-fill" style="font-size:16px"></i>`,
  dark: `<i class="bi bi-moon-stars-fill" style="font-size:16px"></i>`,
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
  // プレビューでも実UIと同じ外装スタイルをホスト要素へ適用
  // （ボーダー・影・角丸は Shadow DOM 外側で管理されるため）
  Object.assign(selBoxElement.style, {
    maxWidth: `${maxWidth}px`,
    zIndex: "0",
    display: "inline-flex",
    flexWrap: "wrap",
    pointerEvents: "auto",
    // ボーダー幅によるレイアウト崩れを防ぐため、幅にボーダーを含める
    boxSizing: "border-box",
    borderRadius: "0.5rem",
    boxShadow:
      theme === "dark"
        ? "rgba(255, 255, 255, 0.06) 0px 2px 4px"
        : "rgba(0, 0, 0, 0.08) 0px 4px 6px",
  });

  const selBoxGroup = document.createElement("div");
  // content.css の共有スタイルがプレビューに適用されるよう `selBoxGroup` クラスを付与
  selBoxGroup.className = "btn-group1 selBoxGroup my-extension-root flex-wrap1 w-100";
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
  offBtn.innerHTML = `<i class="bi bi-ban" style="font-size:16px"></i>`;
  selBoxGroup.append(offBtn);

  const expandBtn = document.createElement("button");
  expandBtn.className = `expand-btn btn-sm rounded-bottom ${theme === "light" ? "btn-light1" : "btn-dark1"} w-100 p-0 m-0`;
  expandBtn.id = "expand-button";
  const expandIconExpand = `<i class="bi bi-chevron-compact-down" style="font-size:16px"></i>`;
  const expandIconCollapse = `<i class="bi bi-chevron-compact-up" style="font-size:16px"></i>`;
  expandBtn.innerHTML = isExpanded ? expandIconExpand : expandIconCollapse;

  selBoxElement.innerHTML = selBoxGroup.outerHTML + expandBtn.outerHTML;

  const previewElement = qs<HTMLDivElement>("settings-preview");
  if (previewElement) previewElement.innerHTML = selBoxElement.outerHTML;

  listSites();
}

const SORTABLE_ICON = `<i class="bi bi-list" style="font-size:16px"></i>`;
const VISIBLE_ICON = `<i class="bi bi-eye-fill" style="font-size:16px"></i>`;
const HIDDEN_ICON = `<i class="bi bi-eye-slash-fill" style="font-size:16px"></i>`;
const DELETE_ICON = `<i class="bi bi-trash3" style="font-size:16px"></i>`;

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
