export function windowOnload(): void {
  chrome.storage.local.get(
    ["selectedText", "sites", "isSearchLoad"],
    (data: Record<string, unknown>) => {
      const selectedText = data.selectedText as string | undefined;
      const sites = data.sites as Array<Record<string, unknown>> | undefined;
      const isSearchLoad = Boolean(data.isSearchLoad);
      if (!isSearchLoad || !selectedText) return;

      const currentUrl = window.location.href;
      (sites || []).forEach((site) => {
        const url = site?.url as string | undefined;
        if (!url) return;
        if (currentUrl.includes(url)) {
          const inputForm = site.inputForm as string | undefined;
          const inputButton = site.inputButton as string | undefined;
          const searchInput = inputForm
            ? (document.querySelector(inputForm) as HTMLInputElement | null)
            : null;
          if (searchInput) {
            performSearch(searchInput, selectedText);
          } else if (inputButton) {
            const searchButton = document.querySelector(inputButton) as HTMLElement | null;
            if (searchButton) {
              (searchButton as HTMLButtonElement).click();
              setTimeout(() => {
                const newSearchInput = inputForm
                  ? (document.querySelector(inputForm) as HTMLInputElement | null)
                  : null;
                if (newSearchInput) performSearch(newSearchInput, selectedText);
              }, 200);
            }
          }
        }
      });
    },
  );
}

export function performSearch(searchInput: HTMLInputElement, text: string): void {
  searchInput.focus();
  searchInput.value = text;
  searchInput.dispatchEvent(new Event("input", { bubbles: true }));
  const searchForm = searchInput.closest("form") as HTMLFormElement | null;
  chrome.storage.local.set({ selectedText: "", isSearchLoad: false }, () => {
    if (searchForm) {
      try {
        searchForm.submit();
      } catch (_e) {
        searchInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      }
    }
  });
}
