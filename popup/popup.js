let isEnabled = false;

const enabledElement = document.getElementById('enabled');
const messageDiv = document.getElementById('message');
const manifestData = chrome.runtime.getManifest();

enabledElement.addEventListener('change', (event) => {
  isEnabled = event.target.checked;
  chrome.storage.local.set({ isEnabled: isEnabled }, () => {
    messageOutput(dateTime(), isEnabled ? `選択＆カスタム検索 はONになっています` : `選択＆カスタム検索 はOFFになっています`);
  });
});

chrome.storage.local.get(['settings', 'isEnabled'], (data) => {
  if (enabledElement) {
    isEnabled = data.isEnabled || false;
    enabledElement.checked = isEnabled
  }
  messageOutput(dateTime(), isEnabled ? `選択＆カスタム検索 はONになっています` : `選択＆カスタム検索 はOFFになっています`);
});


const defaultSites = [
  { name: "google.com", url: "https://google.com", searchQuery: "/search?q=", urlSuffix: "", isVisible: true },
  { name: "www.youtube.com", url: "https://www.youtube.com", searchQuery: "/results?search_query=", urlSuffix: "", isVisible: true },
  { name: "x.com", url: "https://x.com", searchQuery: "/search?q=", urlSuffix: "", isVisible: true },
  { name: "www.amazon.co.jp", url: "https://www.amazon.co.jp", searchQuery: "/s?k=", urlSuffix: "", isVisible: true },
  { name: "search.rakuten.co.jp", url: "https://search.rakuten.co.jp", searchQuery: "/search/mall/", urlSuffix: "", isVisible: true },
  { name: "chatgpt.com", url: "https://chatgpt.com", searchQuery: "/search?q=", urlSuffix: "", isVisible: true },
  { name: "www.perplexity.com", url: "https://www.perplexity.com", searchQuery: "/search/new?q=", urlSuffix: "", isVisible: true },
  { name: "open.spotify.com", url: "https://open.spotify.com", searchQuery: "/search/", urlSuffix: "", isVisible: true },
  { name: "www.pixiv.net", url: "https://www.pixiv.net", searchQuery: "/search?q=", urlSuffix: "", isVisible: true },
  { name: "github.com", url: "https://github.com", searchQuery: "/search?q=", urlSuffix: "", isVisible: true },
  { name: "www.deepl.com", url: "https://www.deepl.com", searchQuery: "/#en/ja/", urlSuffix: "", isVisible: true },
  { name: "ja.wikipedia.org", url: "https://ja.wikipedia.org", searchQuery: "/wiki/", urlSuffix: "", isVisible: true },
  { name: "store.steampowered.com", url: "https://store.steampowered.com", searchQuery: "/search/?term=", urlSuffix: "", isVisible: true },
  { name: "www.cmoa.jp", url: "https://www.cmoa.jp", searchQuery: "/search/result/?header_word=", urlSuffix: "", isVisible: true },
  // { name: "getbootstrap.com", url: "https://getbootstrap.com", inputForm: "input[id='docsearch-input']", inputButton: "button[class='DocSearch DocSearch-Button']" },
];


function customSearchPreview() {
  chrome.storage.local.get(['sites', 'iconNum', 'theme', 'isExpanded'], (data) => {
    const sites = data.sites ?? defaultSites;
    const iconNum = data.iconNum ?? 8;
    const theme = data.theme ?? 'light';
    const isExpanded = data.isExpanded ?? false;

    const changeTheme = document.querySelector('#change-theme');
    const changeThemeIcon = document.querySelector('#change-theme-icon');

    changeTheme.checked = theme === 'dark';

    const themeIcons = {
      light: `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brightness-high-fill" viewBox="0 0 16 16">
        <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
      </svg>
      `,
      dark: `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon-stars-fill" viewBox="0 0 16 16">
        <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278" />
        <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z" />
      </svg>
      `
    };

    changeThemeIcon.innerHTML = themeIcons[theme];

    const selBoxElement = document.createElement('div');
    selBoxElement.className = 'my-extension-root sel-box-element';
    const gap = 2;
    const groupPadding = 6;
    const padding = 4;
    const buttonWidth = 20;
    const maxWidth = iconNum * (buttonWidth + (padding * 2) + gap) - gap + groupPadding * 2;
    Object.assign(selBoxElement.style, {
      // position: "absolute",
      maxWidth: `${maxWidth}px`,
      zIndex: 0,
    });

    const selBoxGroup = document.createElement('div');
    selBoxGroup.className = "btn-group1 my-extension-root flex-wrap1 w-100";
    selBoxGroup.style.height = isExpanded
      ? `${20 + (padding * 2) + gap + groupPadding}px`
      : 'auto';
    selBoxGroup.style.backgroundColor = theme === 'light' ? '#ffffff' : '#292e33';
    selBoxGroup.role = "group";
    selBoxGroup.ariaLabel = "search-box";
    selBoxGroup.id = "search-box";
    chrome.storage.local.set({ sites: sites });
    sites.forEach((site, index) => {
      if (index >= iconNum - 1 && isExpanded) return;

      // サイトが非表示設定の場合はスキップする
      const isVisible = site.isVisible !== false;
      if (!isVisible) return;

      const selBox = document.createElement("a");
      const iconUrl = getFaviconUrl(site.url);
      selBox.href = site.url;
      selBox.id = site.name;
      selBox.title = site.name;
      selBox.target = "_blank";
      selBox.className = `btn1 btn-icon1 m-auto1 ${theme === 'light' ? 'btn-light1' : 'btn-dark1'}`;
      selBox.innerHTML = `<img src="${iconUrl}" alt="icon" style="width:20px; height:20px;">`;
      selBoxGroup.append(selBox);
    });

    const previewElement = document.querySelector("#settings-preview");
    const offBtn = document.createElement('button');
    offBtn.className = `btn1 selBoxGroup btn-icon1 ${theme === 'light' ? 'btn-light1' : 'btn-dark1'}`;
    offBtn.style.width = '28px';
    offBtn.id = 'off-button';
    offBtn.title = 'ツールをOFFにする';
    const offIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban" viewBox="0 0 16 16">
    <path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>
    </svg>
    `;
    offBtn.innerHTML = offIcon;
    selBoxGroup.append(offBtn);

    const expandBtn = document.createElement('button');
    expandBtn.className = `expand-btn btn-sm rounded-bottom ${theme === 'light' ? 'btn-light1' : 'btn-dark1'} w-100 p-0 m-0`;
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

    selBoxElement.innerHTML = selBoxGroup.outerHTML + expandBtn.outerHTML;
    previewElement.innerHTML = selBoxElement.outerHTML;

    listSites();
  });
}
customSearchPreview();

const sortableButton = document.querySelector('#sortable-btn-outlined');
const editButton = document.querySelector('#edit-btn-outlined');
const visibleButton = document.querySelector('#visible-btn-outlined');
const deleteButton = document.querySelector('#delete-btn-outlined');

const changeThemeIcon = document.querySelector('#change-theme-icon');
changeThemeIcon.addEventListener('click', (event) => {
  chrome.storage.local.get(['theme'], (data) => {
    const theme = data.theme;
    chrome.storage.local.set({ theme: theme === 'light' ? 'dark' : 'light' }, () => {
      customSearchPreview();
    });
  });
});

document.addEventListener('click', (event) => {
  const target = event.target;
  if (target.closest('#expand-button')) {
    chrome.storage.local.get(['isExpanded'], (data) => {
      const isExpanded = data.isExpanded ?? false;
      // console.log('isExpanded', isExpanded);
      chrome.storage.local.set({ isExpanded: !isExpanded }, () => {
        customSearchPreview();
      });
    });
  }
});

let sortableInstance = null;


function listSites() {
  const sortableIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
    </svg>
  `;
  const visibleIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
      <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
    </svg>
  `;
  const hiddenIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
      <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588M5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>
      <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
    </svg>
  `;
  const deleteIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
      <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
    </svg>
  `;
  chrome.storage.local.get(['sites'], (data) => {
    const sites = data.sites ?? [];
    const siteQueryListBody = document.getElementById('site-query-list-body');
    siteQueryListBody.innerHTML = ''; // 一旦クリア
    sites.forEach((site, index) => {
      const iconUrl = getFaviconUrl(site.url);
      const isVisible = site.isVisible !== false; // undefined or true is visible
      const urlSuffix = normalize(site?.urlSuffix);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="text-center sortable-list-td bg-outline-secondary d-none" style="cursor: grab;">
          ${sortableIcon}
        </td>
        <td class="text-center action-list-td d-none" >
          <button class='btn btn-sm p-0 btn-outline-secondary visible-list-btn d-none ${!isVisible ? "icon-is-hidden" : ""}' data-index="${index}">
            ${isVisible ? visibleIcon : hiddenIcon}
          </button>
          <button class='btn btn-sm p-0 btn-outline-secondary delete-list-btn d-none ${!isVisible ? "icon-is-hidden" : ""}'  >
            ${deleteIcon}
          </button>
        </td>
        <td class="text-center">
          <img src="${iconUrl}" alt="アイコン" style="width:15px; height:15px;">
        </td>
        <td class='text-nowrap'>${site.name}</td>
        <td class='text-nowrap'>${site.url}</td>
        <td class='text-nowrap'>${site.searchQuery}</td>
        <td class='text-nowrap'>${urlSuffix}</td>
        <td class='text-nowrap d-none'>${site.inputForm}</td>
        <td class='text-nowrap d-none'>${site.inputButton}</td>
      `;
      if (!isVisible) {
        // isVisibleがfalseの場合、行をグレーアウトする
        row.querySelectorAll('td').forEach(td => td.classList.add('bg-secondary'));
      }
      siteQueryListBody.appendChild(row); // 1行ずつ追加
    });

    // --- 並び替えボタンの表示制御 ここから ---
    if (sortableInstance) {
      sortableInstance.destroy();
    }
    sortableInstance = new Sortable(siteQueryListBody, {
      handle: '.sortable-list-td',
      animation: 150,
      ghostClass: 'sortable-ghost',
      disabled: !sortableButton.checked,
      onEnd: function (evt) {
        // ドラッグ操作が完了したとき
        const [movedItem] = sites.splice(evt.oldIndex, 1);
        sites.splice(evt.newIndex, 0, movedItem);

        chrome.storage.local.set({ sites: sites }, () => {
          customSearchPreview();
          messageOutput(dateTime(), '登録サイトリストを並び替えました.');
        });
      }
    });

    toggleSortableState(sortableButton.checked);
    toggleEditMode(editButton.checked, false);
    toggleVisibleState(visibleButton.checked);
    toggleDeleteVisibility(deleteButton.checked);
  });
  function normalize(value) {
    return value == null || value === "undefined" ? "" : value;
  }
}

// --- 並び替えボタンの表示制御 ここから ---
const siteQueryListTable = document.getElementById('site-query-list');

function toggleSortableState(checked) {
  document.querySelectorAll('.sortable-list-td').forEach((element) => {
    element.classList.toggle('d-none', !checked);
  });
  if (sortableInstance) {
    sortableInstance.option('disabled', !checked);
  }
  siteQueryListTable.classList.toggle('sorting-enabled', checked);
}

sortableButton.addEventListener("change", (e) => {
  const isChecked = e.target.checked;
  alertInfo(isChecked, '並び替え: ドラッグで登録サイトリストの順番を入れ替えると，「検索先ボックス」の表示順序も同期して更新されます．');
  toggleSortableState(isChecked);

  if (isChecked) {
    editButton.checked = false;
    toggleEditMode(false, false);
    visibleButton.checked = false;
    toggleVisibleState(false);
    deleteButton.checked = false;
    toggleDeleteVisibility(false);
  }
});
// --- 並び替えボタンの表示制御 ここまで ---


// --- 編集ボタンの表示制御 ここから ---
function toggleEditMode(isEditing, shouldSave) {
  const siteQueryListBody = document.getElementById('site-query-list-body');
  const rows = siteQueryListBody.querySelectorAll('tr');

  if (isEditing) {
    editRows(rows);
  } else {
    if (shouldSave && siteQueryListBody.querySelector('input[type="text"]')) {
      chrome.storage.local.get(['sites'], (data) => {
        const sites = data.sites ?? [];
        rows.forEach((row, index) => {
          if (sites[index]) {
            const nameInput = row.cells[3].querySelector('input');
            const urlInput = row.cells[4].querySelector('input');
            const queryInput = row.cells[5].querySelector('input');
            const urlSuffixInput = row.cells[6].querySelector('input');

            if (nameInput && urlInput && queryInput) {
              sites[index].name = nameInput.value;
              sites[index].url = urlInput.value;
              sites[index].searchQuery = queryInput.value;
              sites[index].urlSuffix = urlSuffixInput.value;
            }
          }
        });

        chrome.storage.local.set({ sites: sites }, () => {
          customSearchPreview(); // 検索ボックスを更新
          messageOutput(dateTime(), '登録サイトリストを更新しました．');
        });
      });
    } else {
      // 編集モードから戻す
      exitEditRows(rows);
    }
  }

  // 行を編集モードに切り替え
  function editRows(rows) {
    rows.forEach(row => {
      // hostname, url, searchQuery, urlSuffix
      for (let i = 3; i <= 6; i++) {
        const cell = row.cells[i];
        const originalText = cell.textContent;
        cell.innerHTML = `<input type="text" class="form-control form-control-sm" value="${originalText}">`;
      }
    });
  }

  // 行を編集モードから戻す
  function exitEditRows(rows) {
    rows.forEach(row => {
      // hostname, url, searchQuery, urlSuffix
      for (let i = 3; i <= 6; i++) {
        const cell = row.cells[i];
        const input = cell.querySelector('input');
        if (input) {
          cell.innerHTML = input.value;
        }
      }
    });
  }
}

editButton.addEventListener("change", (e) => {
  const isChecked = e.target.checked;
  alertInfo(isChecked, '編集: 各項目を編集し，再度「編集」ボタンを押すと変更が保存されます．');
  toggleEditMode(isChecked, true);

  if (isChecked) {
    sortableButton.checked = false;
    toggleSortableState(false);
    visibleButton.checked = false;
    toggleVisibleState(false);
    deleteButton.checked = false;
    toggleDeleteVisibility(false);
  }
});

// --- 編集ボタンの表示制御 ここまで ---

// --- 表示ボタンの表示制御 ここから ---
function toggleVisibleState(isVisible) {
  document.querySelectorAll('.action-list-td').forEach((element) => {
    // どちらかのボタンが有効ならtdは表示
    element.classList.toggle('d-none', !isVisible && !deleteButton.checked);
    // visibleボタン自体の表示/非表示
    element.querySelector('.visible-list-btn')?.classList.toggle('d-none', !isVisible);
  });
}

siteQueryListTable.addEventListener('click', (e) => {
  const visibleBtn = e.target.closest('.visible-list-btn');
  if (visibleBtn) {
    const index = parseInt(visibleBtn.dataset.index, 10);
    chrome.storage.local.get(['sites'], (data) => {
      const sites = data.sites ?? [];
      if (sites[index]) {
        // isVisibleプロパティを反転（undefinedの場合はtrueとして扱う）
        sites[index].isVisible = !(sites[index].isVisible !== false);
        chrome.storage.local.set({ sites: sites }, () => {
          // UIを更新
          customSearchPreview();
          listSites();
          messageOutput(dateTime(), `${sites[index].name} の表示を${sites[index].isVisible ? 'ON' : 'OFF'}にしました。`);
        });
      }
    });
  }
});

visibleButton.addEventListener("change", (e) => {
  const isChecked = e.target.checked;
  alertInfo(isChecked, '表示: 表示/非表示を切り替えます.');
  toggleVisibleState(isChecked);

  if (isChecked) {
    editButton.checked = false;
    toggleEditMode(false, false);
    sortableButton.checked = false;
    toggleSortableState(false);
    deleteButton.checked = false;
    toggleDeleteVisibility(false);
  }
});
// --- 表示ボタンの表示制御 ここまで ---

// --- 削除ボタンの表示制御 ここから ---
function toggleDeleteVisibility(isChecked) {
  document.querySelectorAll('.action-list-td').forEach((element) => {
    element.classList.toggle('d-none', !isChecked && !visibleButton.checked);
    element.querySelector('.delete-list-btn')?.classList.toggle('d-none', !isChecked);
  });
};

deleteButton.addEventListener("change", (e) => {
  const isChecked = e.target.checked;
  alertInfo(isChecked, '削除: ゴミ箱アイコンをクリックすると，そのサイトがリストから削除されます．');
  toggleDeleteVisibility(isChecked);

  if (isChecked) {
    editButton.checked = false;
    toggleEditMode(false, false);
    sortableButton.checked = false;
    toggleSortableState(false);
    visibleButton.checked = false;
    toggleVisibleState(false);
  }
});
// --- 削除ボタンの表示制御 ここまで ---

// 検索結果のURL
const searchUrl = document.getElementById("searchUrl");
function searchUrlInput(e) {
  const text = e.target.value;
  searchUrl.type = "text";
  searchUrl.value = decodeURIComponent(text);
  setTimeout(() => searchUrl.type = "url", 0);
}
searchUrl.addEventListener("change", searchUrlInput);
searchUrl.addEventListener("input", searchUrlInput);

// 検索サイト登録
document.getElementById("urlForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const resultSection = document.getElementById("resultSection");
  const registerButton = document.getElementById("registerButton")
  const searchType = document.getElementById("searchType");
  const paramSection = document.getElementById("paramSection");
  const paramSelect = document.getElementById("paramSelect");
  const templateSection = document.getElementById("templateSection");
  const searchTemplate = document.getElementById("searchTemplate");
  const selectLabel = document.getElementById('select-label');
  // Reset UI
  const overwriteSection = document.getElementById("overwrite-confirm-section");
  const overwriteCheckbox = document.getElementById("overwrite-confirm-checkbox");
  overwriteSection.classList.add("d-none");
  overwriteCheckbox.checked = false;
  paramSelect.innerHTML = "";
  templateSection.classList.add("d-none");

  const urlInput = searchUrl.value;
  const url = new URL(urlInput);

  // サイトが既に存在するかどうかを解析時に判定
  chrome.storage.local.get(['sites'], (data) => {
    const sites = data.sites ?? [];
    const name = url.hostname;
    const siteIndex = sites.findIndex(site => site.name === name);

    if (siteIndex !== -1) {
      const overwriteConfirmSection = document.getElementById("overwrite-confirm-section");
      const overwriteConfirmLabel = document.getElementById("overwrite-confirm-label");
      overwriteConfirmLabel.textContent = `${name} は既に存在します．上書き保存する場合はチェックを入れてください．最新に追加された同名サイト（登録サイトリストの下の方）が上書き対象となります．`;
      overwriteConfirmSection.classList.remove("d-none");
    }
  });

  // Detect search type
  const params = url.searchParams;
  if (params.toString()) {
    searchType.textContent = "クエリパラメータ検索";

    // Populate parameters
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

    // Extract keyword from hash (e.g., #search/IT)
    const hashParts = url.hash.split("/").filter((part) => part !== "");
    if (hashParts.length > 0) {
      hashParts.forEach((part, index) => {
        const option = document.createElement("option");
        option.value = index === 0 ? `#${part}` : part; // Keep the first part with the hash symbol
        option.textContent = decodeURIComponent(part);
        paramSelect.appendChild(option);
      });

      paramSection.classList.remove("d-none");
    }
  } else {
    searchType.textContent = "パス型検索";
    selectLabel.textContent = "検索したキーワードを選択してください:";
    // Split the URL path and provide options for selection
    const pathParts = url.pathname.split("/").filter((part) => part !== "");
    if (pathParts.length > 0) {
      pathParts.forEach((part) => {
        part = decodeURIComponent(part);
        const option = document.createElement("option");
        option.value = part;
        option.textContent = part;
        paramSelect.appendChild(option);
      });

      paramSection.classList.remove("d-none");
    }
  }

  resultSection.classList.remove("d-none");
  registerButton.classList.remove("d-none");

  // Register button click
  registerButton.addEventListener("click", function () {
    const name = url.hostname;
    let template, basePath, searchQuery;

    if (searchType.textContent === "クエリパラメータ検索") {
      const selectedParam = paramSelect.value;
      template = `${url.origin}${url.pathname}?${selectedParam}={query}`;
      searchQuery = `${url.pathname}?${selectedParam}=`;
    } else if (searchType.textContent === "フラグメント型検索") {
      const selectedKeyword = paramSelect.value;
      basePath = url.hash.split(selectedKeyword)[0];
      template = `${url.origin}/${basePath}{keyword}`;
      searchQuery = `/${basePath}`;
    } else if (searchType.textContent === "パス型検索") {
      const selectedKeyword = encodeURIComponent(paramSelect.value);
      basePath = url.pathname.split(selectedKeyword)[0];
      template = `${url.origin}${basePath}{keyword}`;
      searchQuery = basePath;
    } else {
      template = "カスタム入力が必要";
    }

    searchTemplate.textContent = template;
    templateSection.classList.remove("d-none");

    chrome.storage.local.get(['sites'], (data) => {
      let sites = data.sites ?? [];
      // 最新の同名サイトの index を取得（末尾優先）
      let siteIndex = -1;
      for (let i = sites.length - 1; i >= 0; i--) {
        if (sites[i].name === name) {
          siteIndex = i;
          break;
        }
      }

      const overwriteConfirmCheckbox = document.getElementById("overwrite-confirm-checkbox");

      if (siteIndex !== -1) {
        // サイトが既に存在する場合
        const shouldOverwrite = overwriteConfirmCheckbox.checked;
        if (shouldOverwrite) {
          sites[siteIndex] = { name, url: url.origin, searchQuery };
          messageOutput(dateTime(), `${name} は既に存在します．上書き登録しました．`);
        } else {
          // 新規追加（重複）
          sites.push({ name, url: url.origin, searchQuery });
          messageOutput(dateTime(), `${name} を追加しました．（重複）`);
        }
      } else {
        // サイトが存在しない場合は通常追加
        sites.push({ name, url: url.origin, searchQuery });
        messageOutput(dateTime(), `${name} を追加しました．`);
      }

      chrome.storage.local.set({ sites }, () => {
        customSearchPreview();
        listSites();
        registerButton.classList.add("d-none"); // 登録後に非表示
      });
    });

  });
});



// DOMの読み込み完了を監視し，完了後に実行
document.addEventListener('DOMContentLoaded', function () {

  const iconWrap = document.querySelector('#icon-wrap');
  chrome.storage.local.get(['isIconWrap'], (data) => {
    const isIconWrap = data.isIconWrap ?? false;
    iconWrap.checked = isIconWrap;
    messageOutput(dateTime(), `アイコンの折り返し：${isIconWrap ? 'ON' : 'OFF'} `);
  });

  iconWrap.addEventListener('change', (event) => {
    const isIconWrap = event.target.checked;
    chrome.storage.local.set({ isIconWrap: isIconWrap }, () => {
      messageOutput(dateTime(), `アイコンの折り返し：${isIconWrap ? 'ON' : 'OFF'}`);
    });
  });

  // アイコンの個数を設定
  const iconNumRange = document.querySelector('#icon-num-range');
  const iconNumText = document.querySelector('#icon-num-text');

  chrome.storage.local.get(['iconNum'], (data) => {
    const value = data.iconNum ?? 8;
    iconNumText.textContent = value;
    iconNumRange.value = value;
    chrome.storage.local.set({ iconNum: value }, () => {
      // customSearchPreview();
      messageOutput(dateTime(), `アイコンの個数：${value} `);
    });
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
  const selectElement = document.querySelector('#search-mode');
  chrome.storage.local.get('searchMode', (data) => {
    const value = data.searchMode ?? 'new-tab';
    selectElement.value = value;
    const optionText = selectElement.options[selectElement.selectedIndex].text;
    chrome.storage.local.set({ searchMode: value }, () => {
      messageOutput(dateTime(), `検索モード：${optionText}`);
    });
  });

  selectElement.addEventListener('change', () => {
    const optionText = selectElement.options[selectElement.selectedIndex].text;
    chrome.storage.local.set({ searchMode: selectElement.value }, () => {
      messageOutput(dateTime(), `検索モードが ${optionText} に変更されました`);
    });
  });

  // 配置
  const selectPosition = document.querySelector('#select-position');
  const searchBoxDistance = document.querySelector('#search-box-distance');

  chrome.storage.local.get(['selectPosition'], ({ selectPosition: value = 'default' }) => {
    selectPosition.value = value;
    searchBoxDistance.classList.toggle('d-none', value !== 'default');
    const optionText = selectPosition.options[selectPosition.selectedIndex].text;
    chrome.storage.local.set({ selectPosition: value }, () => {
      messageOutput(dateTime(), `配置： ${optionText}`);
      searchBoxDistance.classList.toggle('d-none', value !== 'default');
    });
  });

  selectPosition.addEventListener('change', ({ target: { value } }) => {
    const optionText = selectPosition.options[selectPosition.selectedIndex].text;
    chrome.storage.local.set({ selectPosition: value }, () => {
      messageOutput(dateTime(), `配置が ${optionText} に変更されました`);
      searchBoxDistance.classList.toggle('d-none', value !== 'default');
    });
  });

  // 選択テキストの下に表示する検索ボックスの設定
  const textDistanceInput = document.querySelector('#select-text-distance');
  const textDistanceLabel = document.querySelector('#select-text-distance-label');

  chrome.storage.local.get(['textDistance', 'selectPosition'], (data) => {
    const value = data.textDistance ?? 10;
    const position = data.selectPosition ?? 'default';
    textDistanceLabel.textContent = textDistanceInput.value = value;
    chrome.storage.local.set({ textDistance: value }, () => {
      if (position === 'default') {
        messageOutput(dateTime(), `選択したテキストの下距離：${value}`);
      }
    });
  });

  textDistanceInput.addEventListener('input', (event) => {
    const value = event.target.value;
    textDistanceLabel.textContent = value;
    chrome.storage.local.set({ textDistance: value }, () => {
      messageOutput(dateTime(), `選択したテキストの下距離が ${value} に変更されました`);
    });
  });


  // 検索ボックスのURLをクリアするボタン
  const searchUrlInput = document.getElementById('searchUrl');
  const clearButton = document.querySelector('#btn-close');
  clearButton.addEventListener('click', function () {
    searchUrlInput.value = '';
  });

  // リストの削除ボタン
  const siteQueryListBody = document.getElementById('site-query-list-body');
  siteQueryListBody.addEventListener("click", (e) => {
    if (e.target.closest(".delete-list-btn")) {
      const buttons = siteQueryListBody.querySelectorAll('.delete-list-btn');
      const deleteIndex = Array.from(buttons).indexOf(e.target.closest(".delete-list-btn"));
      chrome.storage.local.get(["sites"], (data) => {
        const sites = data.sites ?? [];
        const updatedSites = sites.filter((site, index) => index !== deleteIndex);
        chrome.storage.local.set({ sites: updatedSites }, customSearchPreview);
      });
    }
  });

  const newTabButton = document.getElementById('new-tab-button');
  newTabButton.addEventListener('click', () => {
    chrome.tabs.create({ url: 'popup/popup.html' });
  })


  // 情報タブ:
  // ストアリンクのクリックイベントを設定
  const extensionLink = document.getElementById('extension_link');
  extensionLink.href = `chrome://extensions/?id=${chrome.runtime.id}`;
  if (extensionLink) clickURL(extensionLink);
  const issueLink = document.getElementById('issue-link');
  if (issueLink) clickURL(issueLink);
  const storeLink = document.getElementById('store_link');
  if (storeLink) clickURL(storeLink);
  // manifest.jsonから拡張機能の情報を取得
  // 各情報をHTML要素に反映
  document.getElementById('extension-id').textContent = `${chrome.runtime.id}`;
  document.getElementById('extension-name').textContent = `${manifestData.name}`;
  document.getElementById('extension-version').textContent = `${manifestData.version}`;
  document.getElementById('extension-description').textContent = `${manifestData.description}`;
  chrome.permissions.getAll((result) => {
    document.getElementById('permission-info').textContent = `${result.permissions.join(', ')}`;

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

function clickURL(link) {
  const url = link.href ? link.href : link;
  if (link instanceof HTMLElement) {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      chrome.tabs.create({ url });
    });
  }
}

function messageOutput(datetime, message) {
  messageDiv.innerHTML += '<p class="m-0">' + datetime + ' ' + message + '</p>'; // <p> タグで囲んでメッセージを新しい行に追加
}

document.querySelector("#clear-button").addEventListener('click', () => {
  messageDiv.innerHTML = '<p class="m-0">' + '' + '</p>'; // メッセージ表示エリアを空にする
});


// 現在の時間を取得する
// "年-月-日 時:分" の形式で返す（例：2024-11-02 10:52）
function dateTime() {
  const now = new Date();
  const year = now.getFullYear();                                    // 年
  const month = String(now.getMonth() + 1).padStart(2, '0');         // 月（0始まりのため+1）
  const day = String(now.getDate()).padStart(2, '0');                // 日
  const hours = String(now.getHours()).padStart(2, '0');             // 時
  const minutes = String(now.getMinutes()).padStart(2, '0');         // 分
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
  return formattedDateTime;
}

function getFaviconUrl(domain) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

// ヘルプ情報表示
function alertInfo(checked, message) {
  const alertInfo = document.getElementById('alert-info');
  alertInfo.classList.toggle('d-none', !checked);
  document.getElementById('alert-info-text').textContent = message;
}