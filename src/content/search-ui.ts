import styles from "./content.css?raw";

const SEARCH_OVERLAY_ID = "search-overlay";

function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

export function customSearch(selectedText: string): void {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // 既にオーバーレイが存在する場合は新たに作成しない
  if (document.getElementById(SEARCH_OVERLAY_ID)) return;

  chrome.storage.local.get(
    [
      "sites",
      "selectPosition",
      "textDistance",
      "theme",
      "iconNum",
      "searchMode",
      "isExpanded",
      "isIconWrap",
    ],
    (data: Record<string, unknown>) => {
      const sites = data.sites as Array<Record<string, unknown>> | undefined;
      const selectPosition = data.selectPosition as string | undefined;
      const textDistance = Number(data.textDistance ?? 5);
      const newTheme = (data.theme as string) || "light";
      const iconNum = Number(data.iconNum ?? 5);
      const searchMode = (data.searchMode as string | undefined) ?? "new-tab";
      const isExpanded = Boolean(data.isExpanded);

      const positions: Record<
        string,
        { top?: number; left?: number; right?: number; bottom?: number; position: string }
      > = {
        default: {
          top: rect.bottom + window.scrollY + textDistance,
          left: rect.left + window.scrollX,
          position: "absolute",
        },
        "top-left": { top: 0, left: 0, position: "fixed" },
        "top-right": { top: 0, right: 0, position: "fixed" },
        "bottom-left": { left: 0, bottom: 0, position: "fixed" },
        "bottom-right": { right: 0, bottom: 0, position: "fixed" },
      };

      const posKey = selectPosition || "default";
      const { top, left, right, bottom, position } = positions[posKey] || positions.default;

      // Shadow host（位置制御用コンテナ）：ページCSSの影響を受けないようインラインスタイルで完結させる
      const host = document.createElement("div");
      host.id = SEARCH_OVERLAY_ID;
      Object.assign(host.style as unknown as CSSStyleDeclaration, {
        position: position,
        zIndex: "2147483647",
        top: top !== undefined ? `${top}px` : undefined,
        left: left !== undefined ? `${left}px` : undefined,
        right: right !== undefined ? `${right}px` : undefined,
        bottom: bottom !== undefined ? `${bottom}px` : undefined,
      });

      const themeColor = newTheme === "dark" ? "#292e33" : "#ffffff";
      const fgColor = newTheme === "dark" ? "#ffffff" : "#0e0d0d";
      host.style.setProperty("--host-theme", themeColor);
      host.style.setProperty("--host-foreground", fgColor);

      // Shadow root：内部要素をページCSSから完全に隔離する
      const shadow = host.attachShadow({ mode: "open" });
      const styleEl = document.createElement("style");
      styleEl.textContent = styles;
      shadow.appendChild(styleEl);

      // ボタングループ
      const selBoxGroup = document.createElement("div");
      selBoxGroup.className = "btn-group1 flex-wrap1";
      host.style.setProperty("--icon-num", String(iconNum));
      // isExpanded === true のときは拡張表示（compactクラスは折りたたみモード）
      if (!isExpanded) selBoxGroup.classList.add("compact");
      else selBoxGroup.classList.remove("compact");
      selBoxGroup.role = "group";
      selBoxGroup.ariaLabel = "検索サイトの選択";
      selBoxGroup.id = "search-box";

      (sites || []).forEach((site) => {
        const isVisible = (site?.isVisible as boolean | undefined) !== false;
        if (!isVisible) return;

        const selBox = document.createElement("a");
        const siteUrl = site?.url as string | undefined;
        const iconUrl = getFaviconUrl(siteUrl || "");
        selBox.href = siteUrl || "#";
        selBox.id = (site?.name as string) || "";
        selBox.title = (site?.name as string) || "";
        selBox.target = "_blank";
        selBox.className = `btn1 btn-icon1 m-auto1`;
        selBox.innerHTML = `<img src="${iconUrl}" alt="アイコン">`;
        selBoxGroup.append(selBox);

        selBox.addEventListener("click", (event) => {
          event.preventDefault();
          const siteSearchQuery = site?.searchQuery as string | undefined;
          const siteUrlSuffix = site?.urlSuffix as string | undefined;
          chrome.storage.local.set({ isSearchLoad: !siteSearchQuery }, () => {
            const searchUrl = siteSearchQuery
              ? `${siteUrl}${siteSearchQuery}${encodeURIComponent(selectedText)}${siteUrlSuffix || ""}`
              : siteUrl || "";
            switch (searchMode) {
              case "new-tab":
                window.open(searchUrl, "_blank");
                break;
              case "current-tab":
                window.location.href = searchUrl;
                break;
              case "new-window":
                chrome.runtime.sendMessage({ action: "createWindow", url: searchUrl });
                break;
              case "incognito":
                chrome.runtime.sendMessage({ action: "createIncognitoWindow", url: searchUrl });
                break;
            }
          });
        });
      });

      const offBtn = document.createElement("button");
      offBtn.className = `btn1 btn-icon1`;
      offBtn.id = "off-button";
      offBtn.title = "ツールをOFFにする";
      offBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban" viewBox="0 0 16 16">
        <path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>
      </svg>
    `;
      const expandBtn = document.createElement("button");
      expandBtn.className = `expand-btn`;
      expandBtn.id = "expand-button";
      const expandIcon = {
        expand: `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-compact-down" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M1.553 6.776a.5.5 0 0 1 .67-.223L8 9.44l5.776-2.888a.5.5 0 1 1 .448.894l-6 3a.5.5 0 0 1-.448 0l-6-3a.5.5 0 0 1-.223-.67"/>
      </svg>
      `,
        collapse: `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-compact-up" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M7.776 5.553a.5.5 0 0 1 .448 0l6 3a.5.5 0 1 1-.448.894L8 6.56 2.224 9.447a.5.5 0 1 1-.448-.894z"/>
      </svg>
      `,
      };
      // isExpanded が true のときは「折りたたむ（collapse）」アイコンを表示する
      expandBtn.innerHTML = expandIcon[isExpanded ? "collapse" : "expand"];
      expandBtn.addEventListener("click", () => {
        host.remove();
        chrome.storage.local.set({ isExpanded: !isExpanded });
      });

      // offBtn はアイコングリッドの最後に入れる
      selBoxGroup.append(offBtn);
      shadow.appendChild(selBoxGroup);
      shadow.appendChild(expandBtn);
      document.body.appendChild(host);

      const rmOverlay = (e: MouseEvent) => {
        if (!host.contains(e.target as Node)) {
          host.remove();
          document.removeEventListener("mousedown", rmOverlay);
        }
      };
      document.addEventListener("mousedown", rmOverlay);

      offBtn.addEventListener("mousedown", () => {
        chrome.storage.local.set({ isEnabled: false }, () => {
          host.remove();
          document.removeEventListener("mousedown", rmOverlay);
        });
      });
    },
  );
}
