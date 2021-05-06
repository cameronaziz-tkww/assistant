declare const chrome: Chrome.Instance;

export const currentTab = (): Promise<number | undefined> => new Promise(
  (resolve, reject) => {
    chrome.tabs.query({ active: true }, (tabs) => {
      const firstTab = tabs[0];
      if (firstTab) {
        resolve(firstTab.id);
        return;
      }

      reject('No Tab Selected');
    });
  },
);
