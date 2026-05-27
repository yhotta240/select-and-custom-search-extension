export type Theme = "light" | "dark";
export type SelectPosition = "default" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type SearchMode = "new-tab" | "current-tab" | "new-window" | "incognito";
export interface Site {
  name: string;
  url: string;
  searchQuery?: string;
  urlSuffix?: string;
  isVisible?: boolean;
  inputForm?: string;
  inputButton?: string;
}

export type Settings = {
  theme: Theme;
  selectPosition: SelectPosition;
  searchMode: SearchMode;
  iconNum: number;
  textDistance: number;
  isExpanded: boolean;
  isIconWrap: boolean;
  sites: Site[];
};

export const DEFAULT_SITES: Site[] = [
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

export const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  selectPosition: "default",
  searchMode: "new-tab",
  iconNum: 5,
  textDistance: 5,
  isExpanded: false,
  isIconWrap: false,
  sites: DEFAULT_SITES,
};
