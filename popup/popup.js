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
    messageOutput(dateTime(), isEnabled ? `選択＆カスタム検索 は無効になっています` : `選択＆カスタム検索 は無効になっています`);
  });
});


// 保存された設定（'settings'と'isEnabled'）を読み込む
chrome.storage.local.get(['settings', 'isEnabled'], (data) => {
  if (enabledElement) {
    isEnabled = data.isEnabled || false; // 'isEnabled'が未設定の場合はデフォルトでfalseを使用
    enabledElement.checked = isEnabled; // チェックボックス（トグルボタン）の状態を'isEnabled'の値に設定
  }
  // 有効/無効状態に応じてメッセージを出力
  messageOutput(dateTime(), isEnabled ? `選択＆カスタム検索 は無効になっています` : `選択＆カスタム検索 は無効になっています`);
});

customSearchPreview();
function customSearchPreview(iconNum) {
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
    backgroundColor: '#ffffff',
    pointerEvents: 'absolute', // クリック可能にする
    maxWidth: `${maxWidth}px`,
  });
  selBoxGroup.className = "btn-group1 my-extension-root flex-wrap1";
  selBoxGroup.role = "group";
  selBoxGroup.ariaLabel = "アイコンリンクボタングループ";
  selBoxGroup.id = "search-box"

  const sites = [
    { name: "googlecom", url: "https://google.com", searchQuery: "search?q=" },
    { name: "youtubecom", url: "https://youtube.com", searchQuery: "results?search_query=" },
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

  sites.forEach((site, index) => {
    const selBox = document.createElement("a");
    console.log("site", site);
    const iconUrl = getFaviconUrl(site.url);
    console.log("iconURL", iconUrl);
    selBox.href = site.url;
    selBox.id = site.name;
    selBox.target = "_blank";

    selBox.className = `btn1 selBoxGroup btn-icon1 m-auto1 btn-light1`;
    selBox.innerHTML = `<img src="${iconUrl}" alt="アイコン" style="width:20px; height:20px;">`;
    selBoxGroup.append(selBox);
    selBox.addEventListener('click', () => {
      // const searchUrl = `${site.url}/${site.searchQuery}${encodeURIComponent(selectedText)}`;
      // window.open(searchUrl, '_blank');
    });
    selBox.draggable = true;
    selBox.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', index);
      selBox.classList.add('dragging');
    });

    selBox.addEventListener('dragend', () => {
      selBox.classList.remove('dragging');
      document.querySelectorAll('.selBoxGroup').forEach(el => el.classList.remove('over'));
    });

    selBox.addEventListener('dragover', (e) => {
      e.preventDefault();
      const overElement = e.target.closest('a');
      if (overElement && overElement !== selBox) {
        overElement.classList.add('over');
      }
    });

    selBox.addEventListener('dragleave', (e) => {
      const overElement = e.target.closest('a');
      if (overElement && overElement !== selBox) {
        overElement.classList.remove('over');
      }
    });

    selBox.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggedIndex = e.dataTransfer.getData('text/plain');
      const targetIndex = index;

      if (draggedIndex !== targetIndex) {
        const draggedElement = selBoxGroup.children[draggedIndex];
        const targetElement = selBoxGroup.children[targetIndex];

        if (draggedIndex < targetIndex) {
          selBoxGroup.insertBefore(draggedElement, targetElement.nextSibling);
        } else {
          selBoxGroup.insertBefore(draggedElement, targetElement);
        }
      }
      document.querySelectorAll('.selBoxGroup a').forEach(el => el.classList.remove('over'));
    });

    // 画像のドラッグを無効にする
    // selBox.querySelector('img').addEventListener('dragstart', (e) => {
    //   e.preventDefault();
    // });
  });

  // #settings 要素を取得
  const previewElement = document.querySelector("#settings-preview");

  // 最初に挿入
  // previewElement.appendChild(selBoxGroup);
  previewElement.innerHTML = selBoxGroup.outerHTML;
  themeChange(false);
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
  } else if (url.pathname.includes("/search/")) {
    searchType.textContent = "パス型検索";
    paramSection.classList.add("d-none");
  } else {
    searchType.textContent = "URL変化なし検索";
    paramSection.classList.add("d-none");
  }

  resultSection.classList.remove("d-none");

  // Register button click
  document.getElementById("registerButton").onclick = function () {
    let template;
    if (searchType.textContent === "クエリパラメータ検索") {
      const selectedParam = paramSelect.value;
      template = `${url.origin}${url.pathname}?${selectedParam}={query}`;
    } else if (searchType.textContent === "パス型検索") {
      template = urlInput.replace(/[^/]+$/, "{query}");
    } else {
      template = "カスタム入力が必要";
    }

    searchTemplate.textContent = template;
    templateSection.classList.remove("d-none");
  };
});

const changeThemeIcon = document.querySelector('#change-theme-icon');
function themeChange(isClicking = false) {
  const searchBtnGroup = document.querySelector('.my-extension-root.btn-group1');
  const searchButton = document.querySelector('#search-box a');
  console.log("isClicking", isClicking);
  chrome.storage.local.get(['theme'], (data) => {
    console.log("data.theme", data.theme);
    const currentTheme = data.theme;
    const newTheme = isClicking ? currentTheme === 'light' ? 'dark' : 'light' : currentTheme;
    console.log("newTheme", newTheme);
    // アイコンの切り替え
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

    const changeTheme = document.getElementById('change-theme');
    changeTheme.checked = newTheme === 'dark';
    if (newTheme === 'dark') {
      searchBtnGroup.style.backgroundColor = '#292e33';
      // const btnThemeColor = "btn-dark1";
      // customSearchPreview(btnThemeColor);
      searchBtnGroup.querySelectorAll('*').forEach(child => {
        child.classList.remove('btn-light1');
        child.classList.add('btn-dark1');
      });
      console.log("searchButton.classList dark", searchButton.classList);
    } else {
      searchBtnGroup.style.backgroundColor = '#ffffff';
      // const btnThemeColor = "btn-light1";
      // customSearchPreview(btnThemeColor);
      searchBtnGroup.querySelectorAll('*').forEach(child => {
        child.classList.remove('btn-dark1');
        child.classList.add('btn-light1');
      });
      console.log("searchButton.classList light", searchButton.classList);
    }
    changeThemeIcon.innerHTML = newTheme === 'light' ? lightIcon : darkIcon;
    chrome.storage.local.set({ theme: newTheme }, () => {
    });
  });
}
// 初期化
themeChange(false);
changeThemeIcon.addEventListener('click', () => themeChange(true));


// DOMの読み込み完了を監視し，完了後に実行
document.addEventListener('DOMContentLoaded', function () {
  const selectPosition = document.querySelector('#select-position');

  function updateSelectPosition(value, isSelect = false) {
    console.log(`選択された位置: ${value}`);
    if (!isSelect) {
      chrome.storage.local.get(['selectPosition'], (data) => {
        value = data.selectPosition;
        selectPosition.value = value;
      });
    } else {
      selectPosition.value = value;
      chrome.storage.local.set({ selectPosition: value }, () => {
        console.log(`選択された位置が ${value} に変更されました`);
        messageOutput(dateTime(), `選択された位置が ${value} に変更されました`);
      });
    }
  }

  selectPosition.addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    console.log(`選択された位置: ${selectedValue}`);
    updateSelectPosition(selectedValue, true);
  });
  updateSelectPosition(selectPosition.value, false);


  selectPosition.value = 'top';

  const iconNumRange = document.querySelector('#icon-num-range');
  const iconNumText = document.querySelector('#icon-num-text');

  function updateIconNumText(value, isInput = false) {
    console.log(`選択されたアイコンの個数: ${value}`);
    if (!isInput) {
      chrome.storage.local.get(['iconNum'], (data) => {
        console.log("data.iconNum", data.iconNum);
        value = data.iconNum;
        iconNumText.textContent = value;
        iconNumRange.value = value;
        customSearchPreview(value);
      });
    } else {
      iconNumText.textContent = value;
      customSearchPreview(value);
      chrome.storage.local.set({ iconNum: value }, () => {
        console.log(`アイコンの個数が ${value} に変更されました`);
        messageOutput(dateTime(), `アイコンの個数が ${value} に変更されました`);
      });
    }
  }

  iconNumRange.addEventListener('input', (event) => {
    updateIconNumText(event.target.value, true);
  });
  updateIconNumText(iconNumRange.value, false);

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
