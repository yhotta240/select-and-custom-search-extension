import styles from "./content.css?raw";

function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

export function customSearch(selectedText: string): void {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

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
      const isIconWrap = Boolean(data.isIconWrap);

      const gap = 2;
      const groupPadding = 6;
      const padding = 4;
      const buttonWidth = 20;
      let maxWidth = iconNum * (buttonWidth + 2 * padding + gap) - gap + 2 * groupPadding;

      const positions: Record<
        string,
        { top?: number; left?: number; right?: number; bottom?: number; position?: string }
      > = {
        default: {
          top: rect.bottom + window.scrollY + textDistance,
          left: rect.left + window.scrollX,
          position: "absolute",
        },
        "top-left": { top: 0, left: 0 },
        "top-right": { top: 0, right: 0 },
        "bottom-left": { left: 0, bottom: 0 },
        "bottom-right": { right: 0, bottom: 0 },
      };

      const posKey = selectPosition || "default";
      const { top, left, right, bottom, position } = positions[posKey] || positions.default;
      const windowWidth = document.documentElement.clientWidth;
      let newIconsButton: number | undefined;

      const isWrapWidth = posKey === "default" && (left ?? 0) + maxWidth > windowWidth;

      if (posKey === "default" && isWrapWidth) {
        const width = windowWidth - (left ?? 0);
        const iconsWidth = width - 2 * groupPadding;
        const iconsButton = iconsWidth / (buttonWidth + 2 * padding + gap);

        if (iconNum > iconsButton) {
          newIconsButton = isIconWrap
            ? Math[
                (iconsButton - Math.floor(iconsButton) >= 0.95 ? "ceil" : "floor") as
                  | "ceil"
                  | "floor"
              ](iconsButton)
            : undefined;
          if (isIconWrap && typeof newIconsButton === "number") {
            maxWidth = newIconsButton * (buttonWidth + 2 * padding + gap) - gap + 2 * groupPadding;
          }
        }
      }

      const backgroundColor = newTheme === "dark" ? "#292e33" : "#ffffff";

      // Shadow host（位置制御用コンテナ）：ページCSSの影響を受けないようインラインスタイルで完結させる
      const host = document.createElement("div");
      Object.assign(host.style as unknown as CSSStyleDeclaration, {
        position: position || "fixed",
        zIndex: "2147483647",
        top: top !== undefined ? `${top}px` : undefined,
        left: !isIconWrap && isWrapWidth ? undefined : left !== undefined ? `${left}px` : undefined,
        right: !isIconWrap && isWrapWidth ? "0px" : right !== undefined ? `${right}px` : undefined,
        bottom: bottom !== undefined ? `${bottom}px` : undefined,
        pointerEvents: "auto",
        maxWidth: `${maxWidth}px`,
        backgroundColor,
        borderRadius: "0.5rem",
        boxShadow: "rgba(0, 0, 0, 0.3) 0px 4px 6px",
        display: "inline-flex",
        flexWrap: "wrap",
        height: "auto",
        verticalAlign: "middle",
      });

      // Shadow root：内部要素をページCSSから完全に隔離する
      const shadow = host.attachShadow({ mode: "open" });
      const styleEl = document.createElement("style");
      styleEl.textContent = styles;
      shadow.appendChild(styleEl);

      // ボタングループ
      const btnThemeColor = newTheme === "dark" ? "btn-dark1" : "btn-light1";
      const selBoxGroup = document.createElement("div");
      selBoxGroup.className = "btn-group1 flex-wrap1";
      selBoxGroup.style.width = isIconWrap ? "auto" : `${maxWidth}px`;
      selBoxGroup.style.height = isExpanded ? `${20 + padding * 2 + groupPadding}px` : "auto";
      selBoxGroup.style.backgroundColor = backgroundColor;
      selBoxGroup.role = "group";
      selBoxGroup.ariaLabel = "アイコンリンクボタングループ";
      selBoxGroup.id = "search-box";

      const threshold = (newIconsButton ?? iconNum) - 1;
      (sites || []).forEach((site, index) => {
        if (isExpanded && index >= threshold) return;
        const isVisible = (site?.isVisible as boolean | undefined) !== false;
        if (!isVisible) return;

        const selBox = document.createElement("a");
        const siteUrl = site?.url as string | undefined;
        const iconUrl = getFaviconUrl(siteUrl || "");
        selBox.href = siteUrl || "#";
        selBox.id = (site?.name as string) || "";
        selBox.title = (site?.name as string) || "";
        selBox.target = "_blank";
        selBox.className = `btn1 btn-icon1 m-auto1 ${btnThemeColor}`;
        selBox.innerHTML = `<img src="${iconUrl}" alt="アイコン" style="width:20px; height:20px;">`;
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
      offBtn.className = `btn1 selBoxGroup btn-icon1 ${btnThemeColor}`;
      offBtn.style.width = "28px";
      offBtn.id = "off-button";
      offBtn.title = "ツールをOFFにする";
      offBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban" viewBox="0 0 16 16">
        <path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>
      </svg>
    `;
      selBoxGroup.append(offBtn);

      const expandBtn = document.createElement("button");
      expandBtn.className = `expand-btn ${btnThemeColor}`;
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
      expandBtn.innerHTML = expandIcon[isExpanded ? "expand" : "collapse"];
      expandBtn.addEventListener("click", () => {
        host.remove();
        chrome.storage.local.set({ isExpanded: !isExpanded });
      });

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
