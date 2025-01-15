let isEnabled = false;
// let isSearchLoad = false;
const manifestData = chrome.runtime.getManifest();
// ツールの有効/無効を処理する関数
const handleTool = (isEnabled) => {
  if (isEnabled) {
    // console.log(`${manifestData.name} がONになりました`);
    document.addEventListener('mouseup', eventHandler);
    windowOnload();
  } else {
    // console.log(`${manifestData.name} がOFFになりました`);
    document.removeEventListener('mouseup', eventHandler);
  }
};


// 最初の読み込みまたはリロード後に実行する処理
chrome.storage.local.get(['settings', 'isEnabled', 'selectedText'], (data) => {
  isEnabled = data.isEnabled !== undefined ? data.isEnabled : isEnabled;
  handleTool(isEnabled);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'q' && e.ctrlKey && !e.shiftKey && !e.altKey) {
    chrome.storage.local.get(['settings', 'isEnabled'], (data) => {
      isEnabled = !data.isEnabled;
      chrome.storage.local.set({ settings: data.settings, isEnabled: isEnabled });
      handleTool(isEnabled);
    });
  }
});

chrome.storage.onChanged.addListener((changes) => {
  isEnabled = changes.isEnabled ? changes.isEnabled.newValue : isEnabled;
  handleTool(isEnabled);
});


// ページが読み込まれた後に実行
function windowOnload() {
  chrome.storage.local.get(['selectedText', 'sites', 'isSearchLoad'], (data) => {
    const { selectedText, sites, isSearchLoad } = data;
    if (!isSearchLoad || !selectedText) return;

    const currentUrl = window.location.href;
    sites.forEach((site) => {
      if (currentUrl.includes(site.url)) {
        const searchInput = document.querySelector(site.inputForm);
        if (searchInput) {
          performSearch(searchInput, selectedText);
        } else {
          const searchButton = document.querySelector(site.inputButton);
          if (searchButton) {
            searchButton.click();
            setTimeout(() => {
              const newSearchInput = document.querySelector(site.inputForm);
              if (newSearchInput) performSearch(newSearchInput, selectedText);
            }, 200);
          }
        }
      }
    });
  });
}

function performSearch(searchInput, text) {
  searchInput.focus();
  searchInput.value = text;
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  const searchForm = searchInput.closest('form');
  chrome.storage.local.set({ selectedText: "", isSearchLoad: false }, () => {
    if (searchForm) {
      try {
        searchForm.submit();
        // console.log('submit');
      } catch (e) {
        searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        // console.log('enter');
      }
    }
  });
}



function eventHandler() {
  const selectedText = window.getSelection().toString().trim();
  if (!selectedText) { return; }
  // console.log('選択されたテキスト:', selectedText);
  chrome.storage.local.set({ selectedText: selectedText }, () => {
    customSearch(selectedText);
    // console.log("選択されたテキストを保存しました");
  });
};

function customSearch(selectedText) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  // オーバーレイ要素を作成
  chrome.storage.local.get(['sites', 'selectPosition', 'textDistance', 'theme', 'iconNum', 'searchMode', 'isExpanded'], (data) => {
    const { sites, selectPosition, textDistance, theme: newTheme, iconNum, searchMode, isExpanded } = data;

    const selBoxElement = document.createElement('div');
    selBoxElement.className = 'my-extension-root sel-box-element';
    const gap = 2;
    const groupPadding = 6;
    const padding = 4;
    const buttonWidth = 20;
    const maxWidth = iconNum * (buttonWidth + (padding * 2) + gap) - gap + groupPadding * 2;
    // console.log("maxWidth", maxWidth);

    const positions = {
      'default': { top: `${rect.bottom + window.scrollY + Number(textDistance)}px`, left: `${rect.left + window.scrollX}px`, position: 'absolute' },
      'top-left': { top: '0px', left: '0px', right: 'auto', bottom: 'auto' },
      'top-right': { top: '0px', left: 'auto', right: '0px', bottom: 'auto' },
      'bottom-left': { top: 'auto', left: '0px', right: 'auto', bottom: '0px' },
      'bottom-right': { top: 'auto', left: 'auto', right: '0px', bottom: '0px' }
    };

    const { top, left, right, bottom, position } = positions[selectPosition] || positions['default'];
    const backgroundColor = newTheme === 'dark' ? '#292e33' : '#ffffff';

    Object.assign(selBoxElement.style, {
      position: position || 'fixed',
      top: top,
      left: left,
      right: right,
      bottom: bottom,
      pointerEvents: 'absolute',
      maxWidth: `${maxWidth}px`,
      backgroundColor: backgroundColor,
    });

    const selBoxGroup = document.createElement('div');
    const btnThemeColor = newTheme === 'dark' ? 'btn-dark1' : 'btn-light1';

    selBoxGroup.className = "btn-group1 my-extension-root flex-wrap1 ";
    selBoxGroup.style.height = isExpanded
      ? `${20 + (padding * 2) + gap + groupPadding}px`
      : 'auto';
    selBoxGroup.style.backgroundColor = backgroundColor;
    selBoxGroup.role = "group";
    selBoxGroup.ariaLabel = "アイコンリンクボタングループ";
    selBoxGroup.id = "search-box";

    sites.forEach((site, index) => {
      if (index >= iconNum - 1 && isExpanded) return;
      const selBox = document.createElement("a");
      const iconUrl = getFaviconUrl(site.url);
      selBox.href = site.url;
      selBox.id = site.name;
      selBox.target = "_blank";
      selBox.className = `btn1 btn-icon1 m-auto1 ${btnThemeColor}`;
      selBox.innerHTML = `<img src="${iconUrl}" alt="アイコン" style="width:20px; height:20px;">`;
      selBoxGroup.append(selBox);

      selBox.addEventListener('click', function (event) {
        event.preventDefault();
        chrome.storage.local.set({ isSearchLoad: site.searchQuery ? false : true }, function () {
          const searchUrl = site.searchQuery ? `${site.url}${site.searchQuery}${encodeURIComponent(selectedText)}` : site.url;
          switch (searchMode) {
            case 'new-tab':
              window.open(searchUrl, '_blank');
              break;
            case 'current-tab':
              window.location.href = searchUrl;
              break;
            case 'new-window':
              chrome.runtime.sendMessage({ action: 'createWindow', url: searchUrl });
              break;
            case 'incognito':
              chrome.runtime.sendMessage({ action: 'createIncognitoWindow', url: searchUrl });
              break;
          }
        });
      });
    });

    const offBtn = document.createElement('button');
    offBtn.className = `btn1 selBoxGroup btn-icon1 ${newTheme === 'light' ? 'btn-light1' : 'btn-dark1'}`;
    offBtn.style.width = '28px';
    offBtn.id = 'off-button';
    const hiddenIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban" viewBox="0 0 16 16">
        <path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>
      </svg>
    `;
    offBtn.innerHTML = hiddenIcon;
    selBoxGroup.append(offBtn);

    // console.log("selBoxGroup", selBoxGroup);
    // console.log("selBoxGroup.children", selBoxGroup.children);
    const expandBtn = document.createElement('button');
    expandBtn.className = `expand-btn ${newTheme === 'light' ? 'btn-light1' : 'btn-dark1'}`;
    expandBtn.id = 'expand-button';
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
      `
    };
    expandBtn.innerHTML = expandIcon[isExpanded ? 'expand' : 'collapse'];
    expandBtn.addEventListener('click', () => {
      const newHeight = isExpanded ? 'auto' : `${20 + padding * 2 + gap + groupPadding}px`;
      selBoxGroup.style.height = newHeight;
      selBoxElement.outerHTML = "";
      expandBtn.innerHTML = expandIcon[isExpanded ? 'expand' : 'collapse'];
      chrome.storage.local.set({ isExpanded: !isExpanded });
    });
    selBoxElement.appendChild(selBoxGroup);
    selBoxElement.appendChild(expandBtn);

    document.body.appendChild(selBoxElement);


    // オーバーレイを消す処理
    const rmOverlay = (e) => {
      if (!selBoxElement.contains(e.target)) {
        selBoxElement.remove();
        document.removeEventListener('mousedown', rmOverlay);
      }
    };
    document.addEventListener('mousedown', rmOverlay);

    const rmOffBtn = () => {
      chrome.storage.local.set({ isEnabled: false }, () => {
        selBoxElement.remove();
        offBtn.removeEventListener('mousedown', rmOffBtn);
      });
    };
    offBtn.addEventListener('mousedown', rmOffBtn);
  });

}

function getFaviconUrl(domain) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}



