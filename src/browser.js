import FETCH_POLYFILL from 'fetch';

export const isChrome = typeof global.chrome !== 'undefined';

/** @returns {chrome} */
const getBrowser = () => {
    if (isChrome) {
        return global.chrome;
    }
    return global.browser;
};

/** @param {chrome.storage}
 * @returns {Storage}
*/

export const storageWrapper = storage => ({
    getItem(key) {
        return new Promise((resolve) => {
            storage.get([key], (items) => {
                if (!items || !items[key]) {
                    return resolve(null);
                }
                return resolve(items[key]);
            });
        });
    },
    getItems(keys) {
        return new Promise((resolve) => {
            storage.get(keys, items => resolve(items));
        });
    },
    setItem(key, value) {
        storage.set({ [key]: value });
    },
    removeItem(key) {
        storage.remove(key);
    },
    clear() {
        storage.clear();
    },
    getAllSettings() {
        return this.getItems(null);
    },
});

export const browser = getBrowser();

export const fetch = window.fetch || FETCH_POLYFILL;

export const onTabClosed = async (tab, message) =>
    new Promise((resolve, reject) => {
        browser.tabs.onRemoved.addListener((tabId) => {
            if (tabId === tab.id) {
                reject(new Error(message));
            }
        });
    });
