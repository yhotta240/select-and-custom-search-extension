let isEnabled = false;
// let isSearchLoad = false;
const manifestData = chrome.runtime.getManifest();
// ツールの有効/無効を処理する関数
const handleTool = (isEnabled) => {
  if (isEnabled) {
    console.log(`${manifestData.name} がONになりました`);
    // console.log("isAfterLoad1111", isSearchLoad);
    document.addEventListener('mouseup', eventHandler);
    windowOnload();
  } else {
    console.log(`${manifestData.name} がOFFになりました`);
    document.removeEventListener('mouseup', eventHandler);
  }
};


// 最初の読み込みまたはリロード後に実行する処理
chrome.storage.local.get(['settings', 'isEnabled', 'selectedText'], (data) => {
  console.log("data", data)
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
  console.log("events");
  chrome.storage.local.get(['selectedText', 'sites', 'isSearchLoad'], (data) => {
    const { selectedText, sites, isSearchLoad } = data;
    console.log('data:', data);
    console.log('受信したテキスト:', selectedText);
    console.log("isSearchLoad", isSearchLoad);
    if (!isSearchLoad || !selectedText) return;

    const currentUrl = window.location.href;
    sites.forEach((site) => {
      if (currentUrl.includes(site.url)) {
        console.log('site:', site);
        const searchInput = document.querySelector(site.inputForm);
        console.log('searchInput:', searchInput);
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
    console.log("isSearchLoadをfalseにしました");
    console.log("selectedTextを空にしました");
    if (searchForm) {
      try {
        searchForm.submit();
        console.log('submit');
      } catch (e) {
        searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        console.log('enter');
      }
    }
  });
}



function eventHandler() {
  const selectedText = window.getSelection().toString().trim();
  if (!selectedText) { return; }
  console.log('選択されたテキスト:', selectedText);
  chrome.storage.local.set({ selectedText: selectedText }, () => {
    customSearch(selectedText);
    console.log("選択されたテキストを保存しました");
  });
};

function customSearch(selectedText) {
  // 選択範囲を取得
  const selection = window.getSelection();
  if (!selection.rangeCount) return;


  const range = selection.getRangeAt(0); // 選択範囲を取得
  const rect = range.getBoundingClientRect(); // 選択範囲の座標を取得
  console.log("rect", rect);
  console.log("rect.bottom + window.scrollY + 100", rect.bottom + window.scrollY + 100);
  // オーバーレイ要素を作成
  chrome.storage.local.get(['sites', 'selectPosition', 'textDistance', 'theme', 'iconNum', 'searchMode'], (data) => {
    console.log("data.selectPosition", data.selectPosition);
    const { sites, selectPosition, textDistance, theme: newTheme, iconNum, searchMode } = data;

    const selBoxGroup = document.createElement('div');
    const gap = 2;
    const groupPadding = 6;
    const padding = 4;
    const buttonWidth = 20;
    const maxWidth = iconNum * (buttonWidth + (padding * 2) + gap) - gap + groupPadding * 2;
    console.log("maxWidth", maxWidth);

    const positions = {
      'default': { top: `${rect.bottom + window.scrollY + Number(textDistance)}px`, left: `${rect.left + window.scrollX}px`, position: 'absolute' },
      'top-left': { top: '0px', left: '0px', right: 'auto', bottom: 'auto' },
      'top-right': { top: '0px', left: 'auto', right: '0px', bottom: 'auto' },
      'bottom-left': { top: 'auto', left: '0px', right: 'auto', bottom: '0px' },
      'bottom-right': { top: 'auto', left: 'auto', right: '0px', bottom: '0px' }
    };

    const { top, left, right, bottom, position } = positions[selectPosition] || positions['default'];
    const backgroundColor = newTheme === 'dark' ? '#292e33' : '#ffffff';
    const btnThemeColor = newTheme === 'dark' ? 'btn-dark1' : 'btn-light1';

    Object.assign(selBoxGroup.style, {
      position: position || 'fixed',
      top: top,
      left: left,
      right: right,
      bottom: bottom,
      pointerEvents: 'absolute',
      maxWidth: `${maxWidth}px`,
      backgroundColor: backgroundColor,
    });

    selBoxGroup.className = "btn-group1 my-extension-root flex-wrap1";
    selBoxGroup.role = "group";
    selBoxGroup.ariaLabel = "アイコンリンクボタングループ";
    selBoxGroup.id = "search-box";

    sites.forEach((site, index) => {
      const selBox = document.createElement("a");
      // console.log("site", site);
      const iconUrl = getFaviconUrl(site.url);
      // console.log("iconURL", iconUrl);
      selBox.href = site.url;
      selBox.id = site.name;
      selBox.target = "_blank";
      selBox.className = `btn1 btn-icon1 m-auto1 ${btnThemeColor}`;
      selBox.innerHTML = `<img src="${iconUrl}" alt="アイコン" style="width:20px; height:20px;">`;
      selBoxGroup.append(selBox);

      selBox.addEventListener('click', function (event) {
        event.preventDefault();
        chrome.storage.local.set({ isSearchLoad: site.searchQuery ? false : true }, function () {
          console.log("isSearchLoadをtrueにしました");
          const searchUrl = site.searchQuery ? `${site.url}${site.searchQuery}${encodeURIComponent(selectedText)}` : site.url;
          console.log("searchMode", searchMode);
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

    // ボタングループのHTML
    console.log("selBoxGroup", selBoxGroup);
    console.log("selBoxGroup.children", selBoxGroup.children);

    // bodyに追加
    document.body.appendChild(selBoxGroup);

    // オーバーレイを消す処理（クリックで削除）
    document.addEventListener('mousedown', function removeOverlay(e) {
      if (!selBoxGroup.contains(e.target)) {
        selBoxGroup.remove();
        document.removeEventListener('mousedown', removeOverlay);
      }
    });
  });

}


function getFaviconUrl(domain) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

function autoSearch(selectedText) {
  const searchInput = document.querySelector('input[name="search"]'); // 検索ボックスを指定
  if (searchInput) {
    searchInput.value = selectedText; // テキストを自動入力
    const searchForm = searchInput.closest('form');
    if (searchForm) {
      searchForm.submit(); // 自動でフォームを送信
    }
  }
}


