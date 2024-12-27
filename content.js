let isEnabled = false;
const manifestData = chrome.runtime.getManifest();
// ツールの有効/無効を処理する関数
const handleSampleTool = (isEnabled) => {
  if (isEnabled) {
    console.log(`${manifestData.name} がONになりました`);
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
  handleSampleTool(isEnabled);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'q' && e.ctrlKey && !e.shiftKey && !e.altKey) {
    chrome.storage.local.get(['settings', 'isEnabled'], (data) => {
      isEnabled = !data.isEnabled;
      chrome.storage.local.set({ settings: data.settings, isEnabled: isEnabled });
      handleSampleTool(isEnabled);
    });
  }
});

chrome.storage.onChanged.addListener((changes) => {
  isEnabled = changes.isEnabled ? changes.isEnabled.newValue : isEnabled;
  handleSampleTool(isEnabled);
});


// ページが読み込まれた後に実行
function windowOnload() {
  window.onload = function (event) {
    console.log("event", event);
    chrome.storage.local.get(['selectedText', 'sites'], (data) => {
      const receivedText = data.selectedText;
      console.log('data:', data);
      console.log('受信したテキスト:', receivedText);
      if (receivedText) {
        const currentUrl = window.location.href;
        sites = data.sites;
        console.log('sites:', sites);
        sites.forEach((site) => {
          if (currentUrl.includes(site.url)) {
            console.log('site:', site);
            const searchInput = document.querySelector(site.inputForm);
            if (searchInput) {
              searchInput.focus();
              searchInput.value = receivedText;
              searchInput.dispatchEvent(new Event('input', { bubbles: true }));
              const searchForm = searchInput.closest('form');
              if (searchForm) {
                try {
                  searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
                } catch (e) {
                  searchForm.submit();
                }
              }
            } else {
              const searchButton = document.querySelector(site.inputButton);
              if (searchButton) {
                searchButton.click();
                setTimeout(() => {
                  Search(receivedText, site.inputForm);
                }, 200);
              }
            }
          }
        });
      }
      chrome.storage.local.set({ selectedText: "" }, () => console.log("ok"));
    });
  };
}

function Search(receivedText, inputForm) {
  const searchInput = document.querySelector(inputForm);
  console.log('searchInputs:', searchInput);
  if (searchInput) {
    searchInput.value = receivedText;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    searchInput.focus();
    // console.log('searchInput.value:', searchInput.value);
    const searchForm = searchInput.closest('form');
    if (searchForm) {
      try {
        searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      } catch (e) {
        searchForm.submit();
      }
    }
  }
}


function eventHandler() {
  const selectedText = window.getSelection().toString().trim();
  if (!selectedText) { return; }
  console.log('選択されたテキスト:', selectedText);
  customSearch(selectedText);
  chrome.storage.local.set({ selectedText: selectedText }, () => {
    console.log("ok")
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
  chrome.storage.local.get(['selectPosition', 'textDistance', 'theme', 'iconNum', 'newTab', 'searchMode'], (data) => {
    console.log("data.selectPosition", data.selectPosition);
    const selectPosition = data.selectPosition;
    const textDistance = Number(data.textDistance);
    const newTheme = data.theme;
    const iconNum = data.iconNum;
    const newTab = data.newTab;
    const searchMode = data.searchMode;

    const selBoxGroup = document.createElement('div');
    // const iconNum = 7;
    const gap = 2;
    const groupPadding = 6;
    const padding = 4;
    const buttonWidth = 20;
    const maxWidth = iconNum * (buttonWidth + (padding * 2) + gap) - gap + groupPadding * 2;
    console.log("maxWidth", maxWidth);

    let fromTop;
    let fromLeft;
    let position = "fixed";
    switch (selectPosition) {
      case 'default':
        fromTop = `${rect.bottom + window.scrollY + textDistance}px`;
        fromLeft = `${rect.left + window.scrollX}px`;
        position = "absolute";
        break;
      case 'top-left':
        fromTop = `0px`;
        fromLeft = `0px`;
        break;
      case 'top-right':
        fromTop = `0px`;
        fromLeft = `${window.innerWidth - maxWidth}px`;
        break;
      case 'bottom-left':
        fromTop = `${window.innerHeight - rect.height}px`;
        fromLeft = `0px`;
        break;
      case 'bottom-right':
        fromTop = `${window.innerHeight - rect.height}px`;
        fromLeft = `${window.innerWidth - maxWidth}px`;
        break;
    }

    const backgroundColor = newTheme === 'dark' ? '#292e33' : '#ffffff';
    const btnThemeColor = newTheme === 'dark' ? 'btn-dark1' : 'btn-light1';
    Object.assign(selBoxGroup.style, {
      position: position,
      top: fromTop,
      left: fromLeft,
      pointerEvents: 'absolute', // クリック可能にする
      maxWidth: `${maxWidth}px`,
      backgroundColor: backgroundColor,
    });
    selBoxGroup.className = "btn-group1 my-extension-root flex-wrap1";
    selBoxGroup.role = "group";
    selBoxGroup.ariaLabel = "アイコンリンクボタングループ";
    selBoxGroup.id = "search-box"

    const sites = [
      { name: "googlecom", url: "https://google.com", searchQuery: "search?q=" },
      { name: "youtubecom", url: "https://www.youtube.com", searchQuery: "results?search_query=" },
      { name: "githubcom", url: "https://github.com", searchQuery: "search?q=" },
      { name: "getbootstrapcom", url: "https://getbootstrap.com", searchQuery: "", inputForm: "input[id='docsearch-input']", inputButton: "button[class='DocSearch DocSearch-Button']" },
      { name: "wwwamazoncojp", url: "https://www.amazon.co.jp", searchQuery: "s?k=" },
      { name: "qiitacom", url: "https://qiita.com", searchQuery: "search?q=" },
      { name: "chatgptcom", url: "https://chatgpt.com", searchQuery: "search?q=", },
      { name: "tverjp", url: "https://tver.jp", searchQuery: "search?q=", inputForm: "input[name='keywordInput']" },
      { name: "chromewebstoregooglecom", url: "https://chromewebstore.google.com", searchQuery: "search?q=" },
      { name: "wwwpixivnet", url: "https://www.pixiv.net", searchQuery: "search?q=" },
      { name: "x.com", url: "https://x.com", searchQuery: "search?q=" },
      { name: "www.perplexity.com", url: "https://www.perplexity.com", searchQuery: "search/new?q=" },
    ];

    sites.forEach((site, index) => {
      const selBox = document.createElement("a");
      // console.log("site", site);
      const iconUrl = getFaviconUrl(site.url);
      console.log("iconURL", iconUrl);
      selBox.href = site.url;
      selBox.id = site.name;
      selBox.target = "_blank";
      selBox.className = `btn1 btn-icon1 m-auto1 ${btnThemeColor}`;
      selBox.innerHTML = `<img src="${iconUrl}" alt="アイコン" style="width:20px; height:20px;">`;
      selBoxGroup.append(selBox);

      selBox.addEventListener('click', () => {
        const searchUrl = site.searchQuery ? `${site.url}/${site.searchQuery}${encodeURIComponent(selectedText)}` : site.url;
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


