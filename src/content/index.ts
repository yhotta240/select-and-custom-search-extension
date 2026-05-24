import { logInfo } from "../utils/logger";

console.log("content script");

logInfo(`ページ読み込み: ${document.title || location.pathname}`, "content");
