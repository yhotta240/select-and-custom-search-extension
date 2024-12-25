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
              searchInput.value = receivedText;
              const searchForm = searchInput.closest('form');
              if (searchForm) {
                try {
                  searchForm.submit();
                } catch (e) {
                  searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
                }
              }
            } else {
              const searchButton = document.querySelector(site.inputButton);
              if (searchButton) {
                searchButton.click();
                setTimeout(() => {
                  Search(receivedText);
                }, 100);
              }
            }
          }
        });
      }
      chrome.storage.local.set({ selectedText: "" }, () => console.log("ok"));
    });
  };
}

function Search(receivedText) {
  const searchInput = document.querySelector('input[id="docsearch-input"]');
  console.log('searchInputs:', searchInput);
  if (searchInput) {
    searchInput.value = receivedText;
    console.log('searchInput.value:', searchInput.value);
    const searchForm = searchInput.closest('form');
    if (searchForm) {
      try {
        searchForm.submit();
      } catch (e) {
        searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
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
  // Search(selectedText);
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
  const selBoxGroup = document.createElement('div');
  const iconNum = 8;
  const gap = 6;
  const padding = 6;
  const buttonWidth = 20;
  const maxWidth = iconNum * (buttonWidth + gap) - gap + padding * 2;
  console.log("maxWidth", maxWidth);
  Object.assign(selBoxGroup.style, {
    position: "absolute",
    top: `${rect.bottom + window.scrollY + 10}px`, // 選択範囲の下に表示
    left: `${rect.left + window.scrollX}px`,
    pointerEvents: 'absolute', // クリック可能にする
    maxWidth: `${maxWidth}px`,
  });
  selBoxGroup.className = "btn-group1 my-extension-root flex-wrap1";
  selBoxGroup.role = "group";
  selBoxGroup.ariaLabel = "アイコンリンクボタングループ";
  selBoxGroup.id = "search-box"

  const sites = [
    { name: "googlecom", url: "https://google.com", searchQuery: "search?q=" },
    { name: "youtubecom", url: "https://www.youtube.com", searchQuery: "search?q=" },
    { name: "githubcom", url: "https://github.com", searchQuery: "search?q=" },
    { name: "getbootstrapcom", url: "https://getbootstrap.com", searchQuery: "search?q=", inputForm: "input[name='q']", inputButton: "button[class='DocSearch DocSearch-Button']" },
    { name: "wwwamazoncojp", url: "https://www.amazon.co.jp", searchQuery: "s?k=" },
    { name: "qiitacom", url: "https://qiita.com", searchQuery: "search?q=" },
    { name: "chatgptcom", url: "https://chatgpt.com", searchQuery: "search?q=", },
    { name: "tverjp", url: "https://tver.jp", searchQuery: "search?q=", inputForm: "input[name='keywordInput']" },
    { name: "chromewebstoregooglecom", url: "https://chromewebstore.google.com", searchQuery: "search?q=" },
    { name: "wwwpixivnet", url: "https://www.pixiv.net", searchQuery: "search?q=" },
    { name: "x.com", url: "https://x.com", searchQuery: "search?q=" },
  ];
  chrome.storage.local.set({ sites: sites }, () => {
    console.log("sites:ok")
  });
  sites.forEach((site, index) => {
    const selBox = document.createElement("a");
    console.log("site", site);
    const iconUrl = getFaviconUrl(site.url);
    console.log("iconURL", iconUrl);
    selBox.href = site.url;
    selBox.id = site.name;
    selBox.target = "_blank";

    selBox.className = `btn1 btn-dark1 btn-icon1 m-auto1`;
    selBox.innerHTML = `<img src="${iconUrl}" alt="アイコン" style="width:20px; height:20px;">`;
    selBoxGroup.append(selBox);
    selBox.addEventListener('click', () => {
      const searchUrl = `${site.url}/${site.searchQuery}${encodeURIComponent(selectedText)}`;
      window.open(searchUrl, '_blank');
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

