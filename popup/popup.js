// 初期化処理
let isEnabled = false; // ツールの有効状態を示すフラグ（初期値はfalse）

const enabledElement = document.getElementById('enabled'); // チェックボックス（トグルボタン）要素を取得
const panelButton = document.getElementById('panelButton');
const messagePanel = document.getElementById('messagePanel');
const messageDiv = document.getElementById('message'); // メッセージ表示用のdiv要素を取得
const manifestData = chrome.runtime.getManifest();

// チェックボックス（トグルボタン）の状態が変更されたとき，ツールの有効/無効状態を更新
enabledElement.addEventListener('change', (event) => {
  isEnabled = event.target.checked; // チェックボックス（トグルボタン）の選択状態を取得

  // 現在の有効/無効状態をストレージに保存
  chrome.storage.local.set({ isEnabled: isEnabled }, () => {
    // 有効/無効状態に応じてメッセージを出力
    messageOutput(dateTime(), isEnabled ? `選択＆カスタム検索 はONになっています` : `選択＆カスタム検索 はOFFになっています`);
  });
});


// 保存された設定（'settings'と'isEnabled'）を読み込む
chrome.storage.local.get(['settings', 'isEnabled'], (data) => {
  if (enabledElement) {
    isEnabled = data.isEnabled || false; // 'isEnabled'が未設定の場合はデフォルトでfalseを使用
    enabledElement.checked = isEnabled; // チェックボックス（トグルボタン）の状態を'isEnabled'の値に設定
  }
  // 有効/無効状態に応じてメッセージを出力
  messageOutput(dateTime(), isEnabled ? `選択＆カスタム検索 はONになっています` : `選択＆カスタム検索 はOFFになっています`);
});


const defaultSites = [
  { name: "google.com", url: "https://google.com", searchQuery: "/search?q=" },
  { name: "youtube.com", url: "https://www.youtube.com", searchQuery: "/results?search_query=" },
  { name: "github.com", url: "https://github.com", searchQuery: "/search?q=" },
  { name: "getbootstrap.com", url: "https://getbootstrap.com", inputForm: "input[id='docsearch-input']", inputButton: "button[class='DocSearch DocSearch-Button']" },
  { name: "www.amazon.co.jp", url: "https://www.amazon.co.jp", searchQuery: "/s?k=" },
  { name: "qiita.com", url: "https://qiita.com", searchQuery: "/search?q=" },
  { name: "chatgpt.com", url: "https://chatgpt.com", searchQuery: "/search?q=", },
  { name: "tver.jp", url: "https://tver.jp/search", inputForm: "input[name='keywordInput']" },
  { name: "chromewebstore.google.com", url: "https://chromewebstore.google.com", searchQuery: "/search?q=" },
  { name: "www.pixiv.net", url: "https://www.pixiv.net", searchQuery: "/search?q=" },
  { name: "x.com", url: "https://x.com", searchQuery: "/search?q=" },
  { name: "www.perplexity.com", url: "https://www.perplexity.com", searchQuery: "/search/new?q=" },
  { name: "open.spotify.com", url: "https://open.spotify.com", searchQuery: "/search/" },
];
console.log("defaultSites", defaultSites);

customSearchPreview();
function customSearchPreview() {
  chrome.storage.local.get(['sites', 'iconNum', 'theme'], (data) => {
    const sites = data.sites ?? defaultSites;
    const iconNum = data.iconNum ?? 8;
    const theme = data.theme ?? 'light';
    console.log('theme', theme);

    const changeTheme = document.getElementById('change-theme');
    changeTheme.checked = theme === 'dark';
    const changeThemeIcon = document.querySelector('#change-theme-icon');
    const lightIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brightness-high-fill" viewBox="0 0 16 16">
      <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
    </svg>
    `;

    const darkIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon-stars-fill" viewBox="0 0 16 16">
      <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278" />
      <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z" />
    </svg>
    `;
    changeThemeIcon.innerHTML = theme === 'light' ? lightIcon : darkIcon;


    const selBoxGroup = document.createElement('div');
    // const iconNum = 7;
    const gap = 2;
    const groupPadding = 6;
    const padding = 4;
    const buttonWidth = 20;
    const maxWidth = iconNum * (buttonWidth + (padding * 2) + gap) - gap + groupPadding * 2;
    console.log("maxWidth", maxWidth);

    Object.assign(selBoxGroup.style, {
      // position: "absolute",
      backgroundColor: theme === 'light' ? '#ffffff' : '#292e33',
      pointerEvents: 'absolute', // クリック可能にする
      maxWidth: `${maxWidth}px`,
      zIndex: 0,
    });
    selBoxGroup.className = "btn-group1 my-extension-root flex-wrap1";
    selBoxGroup.role = "group";
    selBoxGroup.ariaLabel = "アイコンリンクボタングループ";
    selBoxGroup.id = "search-box"
    chrome.storage.local.set({ sites: sites }, () => {
      console.log("sites:ok");
    });
    sites.forEach((site, index) => {
      const selBox = document.createElement("a");
      console.log("site", site);
      const iconUrl = getFaviconUrl(site.url);
      console.log("iconURL", iconUrl);
      selBox.href = site.url;
      selBox.id = site.name;
      selBox.target = "_blank";
      selBox.className = `btn1 selBoxGroup btn-icon1 m-auto1 ${theme === 'light' ? 'btn-light1' : 'btn-dark1'}`;
      selBox.innerHTML = `<img src="${iconUrl}" alt="アイコン" style="width:20px; height:20px;">`;
      selBoxGroup.append(selBox);
      selBox.addEventListener('click', () => {
        // const searchUrl = `${site.url}/${site.searchQuery}${encodeURIComponent(selectedText)}`;
        // window.open(searchUrl, '_blank');
      });
    });

    // #settings 要素を取得
    const previewElement = document.querySelector("#settings-preview");

    // 最初に挿入
    // previewElement.appendChild(selBoxGroup);
    previewElement.innerHTML = selBoxGroup.outerHTML;
    listSites();

    changeThemeIcon.addEventListener('click', () => {
      customSearchPreview();
      chrome.storage.local.set({ theme: theme === 'light' ? 'dark' : 'light' }, () => {
      });
    });
  });
}
// const changeThemeIcon = document.querySelector('#change-theme-icon');
// changeThemeIcon.addEventListener('click', () => {
//   customSearchPreview();
// });

function listSites() {
  chrome.storage.local.get(['sites'], (data) => {
    const sites = data.sites ?? [];
    // console.log("sites", sites);
    // const siteQueryList = document.getElementById('site-query-list');
    const siteQueryListBody = document.getElementById('site-query-list-body');
    siteQueryListBody.innerHTML = ``;
    sites.forEach((site, index) => {
      const iconUrl = getFaviconUrl(site.url);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <img src="${iconUrl}" alt="アイコン" style="width:15px; height:15px;">
        </td>
        <td class='text-nowrap'>${site.url}</td>
        <td class='text-nowrap'>${site.searchQuery}</td>
        <td class='text-nowrap'>${site.inputForm}</td>
        <td class='text-nowrap'>${site.inputButton}</td>
      `;
      siteQueryListBody.innerHTML += row.outerHTML;
    });
  });
}



document.getElementById("urlForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const urlInput = document.getElementById("searchUrl").value;
  const url = new URL(urlInput);

  const resultSection = document.getElementById("resultSection");
  const searchType = document.getElementById("searchType");
  const paramSection = document.getElementById("paramSection");
  const paramSelect = document.getElementById("paramSelect");
  const templateSection = document.getElementById("templateSection");
  const searchTemplate = document.getElementById("searchTemplate");

  // Reset UI
  paramSelect.innerHTML = "";
  templateSection.classList.add("d-none");

  // Detect search type
  const params = url.searchParams;
  console.log("params", params);
  if (params.toString()) {
    searchType.textContent = "クエリパラメータ検索";

    // Populate parameters
    for (const [key, value] of params) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = `${key}=${value}`;
      paramSelect.appendChild(option);
    }

    paramSection.classList.remove("d-none");
  }
  else {
    searchType.textContent = "パス型検索";
    const selectLabel = document.querySelector('#select-label');
    selectLabel.textContent = "検索したキーワードを選択してください:";
    // Split the URL path and provide options for selection
    const pathParts = url.pathname.split("/").filter((part) => part !== "");
    if (pathParts.length > 0) {
      pathParts.forEach((part) => {
        const option = document.createElement("option");
        option.value = part;
        option.textContent = part;
        paramSelect.appendChild(option);
      });

      paramSection.classList.remove("d-none");
    }
  }
  // else if (url.pathname.includes("/search/")) {
  //   searchType.textContent = "パス型検索";
  //   paramSection.classList.add("d-none");
  // } else {
  //   searchType.textContent = "URL変化なし検索";
  //   paramSection.classList.add("d-none");
  // }

  resultSection.classList.remove("d-none");
  // Register button click
  document.getElementById("registerButton").onclick = function () {
    chrome.storage.local.get(['sites'], (data) => {
      console.log("data.sites", data.sites);
      let sites = data.sites ?? [];
      const name = url.hostname;
      let template, basePath, searchQuery;

      if (searchType.textContent === "クエリパラメータ検索") {
        const selectedParam = paramSelect.value;
        template = `${url.origin}${url.pathname}?${selectedParam}={query}`;
        searchQuery = `${url.pathname}?${selectedParam}=`;
      } else if (searchType.textContent === "パス型検索") {
        const selectedKeyword = paramSelect.value;
        basePath = url.pathname.split(selectedKeyword)[0];
        template = `${url.origin}${basePath}{keyword}`;
        searchQuery = basePath;
      } else {
        template = "カスタム入力が必要";
      }

      searchTemplate.textContent = template;
      templateSection.classList.remove("d-none");

      addSite(name, url.origin, searchQuery);

      chrome.storage.local.set({ sites: sites }, () => { });

      function addSite(name, url, searchQuery) {
        const siteIndex = sites.findIndex(site => site.name === name);
        if (siteIndex === -1) {
          sites.push({ name, url, searchQuery, inputForm: "", inputButton: "" });
          console.log(`${name} を追加しました。`);
          messageOutput(dateTime(), `${name} を追加しました。`);
        } else {
          sites[siteIndex] = { name, url, searchQuery };
          console.log(`${name} は既に存在します。上書き登録しました。`);
          messageOutput(dateTime(), `${name} は既に存在します。上書き登録しました。`);
        }
      }
      customSearchPreview();
      listSites();
    });
  };
});



// DOMの読み込み完了を監視し，完了後に実行
document.addEventListener('DOMContentLoaded', function () {
  const selectPosition = document.querySelector('#select-position');
  const searchBoxDistance = document.querySelector('#search-box-distance');

  chrome.storage.local.get(['selectPosition'], ({ selectPosition: value = 'default' }) => {
    selectPosition.value = value;
    searchBoxDistance.classList.toggle('d-none', value !== 'default');
  });

  selectPosition.addEventListener('change', ({ target: { value } }) => {
    chrome.storage.local.set({ selectPosition: value }, () => {
      messageOutput(dateTime(), `選択された位置が ${value} に変更されました`);
      searchBoxDistance.classList.toggle('d-none', value !== 'default');
    });
  });

  // 選択テキストの下に表示する検索ボックスの設定
  const textDistanceInput = document.querySelector('#select-text-distance');
  const textDistanceLabel = document.querySelector('#select-text-distance-label');

  chrome.storage.local.get(['textDistance'], (data) => {
    const value = data.textDistance ?? 10;
    textDistanceLabel.textContent = value;
    textDistanceInput.value = value;
  });

  textDistanceInput.addEventListener('input', (event) => {
    const value = event.target.value;
    textDistanceLabel.textContent = value;
    chrome.storage.local.set({ textDistance: value }, () => {
      messageOutput(dateTime(), `テキストの下距離が ${value} に変更されました`);
    });
  });


  // アイコンの個数を設定
  const iconNumRange = document.querySelector('#icon-num-range');
  const iconNumText = document.querySelector('#icon-num-text');

  chrome.storage.local.get(['iconNum'], (data) => {
    const value = data.iconNum ?? 8;
    iconNumText.textContent = value;
    iconNumRange.value = value;
  });

  iconNumRange.addEventListener('input', (event) => {
    const value = event.target.value;
    iconNumText.textContent = value;
    chrome.storage.local.set({ iconNum: value }, () => {
      customSearchPreview();
      messageOutput(dateTime(), `アイコンの個数が ${value} に変更されました`);
    });
  });

  // 検索モードの設定
  const selectElement = document.getElementById('search-mode');
  chrome.storage.local.get('searchMode', (data) => {
    const value = data.searchMode ?? 'new-tab';
    selectElement.value = value;
    chrome.storage.local.set({ searchMode: value }, () => {
      messageOutput(dateTime(), `検索モードが ${value} に変更されました`);
    });
  });

  selectElement.addEventListener('change', () => {
    chrome.storage.local.set({ searchMode: selectElement.value }, () => {
      messageOutput(dateTime(), `検索モードが ${selectElement.value} に変更されました`);
    });
  });

  // 検索ボックスのURLをクリアするボタン
  const searchUrlInput = document.getElementById('searchUrl');
  const clearButton = document.querySelector('#btn-close');
  clearButton.addEventListener('click', function () {
    searchUrlInput.value = '';
  });



  // メッセージパネルの表示・非表示を切り替える
  panelButton.addEventListener('click', function () {
    // メッセージパネルの高さを指定（必要に応じて調整可能）
    const panelHeight = '170px';

    if (messagePanel.style.height === panelHeight) {
      // パネルが開いている場合は閉じる
      messagePanel.style.height = '0';
      panelButton.textContent = 'メッセージパネルを開く';
    } else {
      // パネルが閉じている場合は開く
      messagePanel.style.height = panelHeight;
      panelButton.textContent = 'メッセージパネルを閉じる';
    }
  });

  // 情報タブ: 
  // ストアリンクのクリックイベントを設定
  const storeLink = document.getElementById('store_link');
  if (storeLink) clickURL(storeLink);
  // manifest.jsonから拡張機能の情報を取得
  // 各情報をHTML要素に反映
  document.getElementById('extension-id').textContent = `${chrome.runtime.id}`;
  document.getElementById('extension-name').textContent = `${manifestData.name}`;
  document.getElementById('extension-version').textContent = `${manifestData.version}`;
  document.getElementById('extension-description').textContent = `${manifestData.description}`;
  chrome.permissions.getAll((result) => {
    let siteAccess;
    if (result.origins.length > 0) {
      if (result.origins.includes("<all_urls>")) {
        siteAccess = "すべてのサイト";
      } else {
        siteAccess = result.origins.join("<br>");
      }
    } else {
      siteAccess = "クリックされた場合のみ";
    }
    document.getElementById('site-access').innerHTML = siteAccess;
  });
  // シークレットモードでのアクセス権を確認し，結果を表示
  chrome.extension.isAllowedIncognitoAccess((isAllowedAccess) => {
    document.getElementById('incognito-enabled').textContent = `${isAllowedAccess ? '有効' : '無効'}`;
  });
  // GitHubリンクのクリックイベントを設定
  const githubLink = document.getElementById('github-link');
  if (githubLink) clickURL(githubLink);

});


// 設定をストレージに保存する関数
function saveSettings(datetime, message, value) {
  const settings = {
    sampleValue: value,
    // storageに保存するための設定をここに追加する
  };

  // ストレージに設定を保存し，保存完了後にメッセージを出力
  chrome.storage.local.set({ settings: settings }, () => {
    messageOutput(datetime, message); // 保存時の日時とメッセージを出力
  });
}


// popup.html内のリンクを新しいタブで開けるように設定する関数
// linkにはgetElementByIdで取得した要素またはURL文字列を渡す
function clickURL(link) {
  const url = link.href ? link.href : link; // linkが要素ならhref属性からURLを取得，URL文字列ならそのまま使用

  // linkがHTML要素の場合のみクリックイベントを設定
  if (link instanceof HTMLElement) {
    link.addEventListener('click', (event) => {
      event.preventDefault(); // デフォルトのリンク遷移を防止
      chrome.tabs.create({ url }); // 新しいタブでURLを開く
    });
  }
}


// メッセージを指定した日時とともに出力する関数
function messageOutput(datetime, message) {
  messageDiv.innerHTML += '<p class="m-0">' + datetime + ' ' + message + '</p>'; // <p> タグで囲んでメッセージを新しい行に追加
}
// メッセージをクリアする処理
document.getElementById('messageClearButton').addEventListener('click', () => {
  messageDiv.innerHTML = '<p class="m-0">' + '' + '</p>'; // メッセージ表示エリアを空にする
});


// 現在の時間を取得する
// "年-月-日 時:分" の形式で返す（例：2024-11-02 10:52）
function dateTime() {
  const now = new Date();// 現在の日付と時刻を取得

  // 各部分の値を取得し2桁に整形
  const year = now.getFullYear();                                    // 年
  const month = String(now.getMonth() + 1).padStart(2, '0');         // 月（0始まりのため+1）
  const day = String(now.getDate()).padStart(2, '0');                // 日
  const hours = String(now.getHours()).padStart(2, '0');             // 時
  const minutes = String(now.getMinutes()).padStart(2, '0');         // 分

  // フォーマットした日時を文字列で返す
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
  return formattedDateTime;
}

function getFaviconUrl(domain) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}
