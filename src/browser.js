/** Return Chrome obj, as I don't know how to use web-ext-types :/
 * @returns {chrome}
 */
const getBrowser = () => {
    if (isChrome) {
        return chrome;
    }
    return browser;
};

/** @param {chrome.storage}
 * @returns {Storage}
*/
export const storageWrapper = (storage = chrome.storage.local) => {
    return {
        getItem(key) {
            return new Promise((resolve) => {
                storage.get([key], (items) => {
                    if (!items || !items[key]) {
                        return resolve(null);
                    }
                    resolve(items[key]);
                });
            })
        },
        setItem(key, value) {
            storage.set({ [key]: value });
        },
        removeItem(key) {
            storage.remove(key);
        },
        clear() {
            storage.clear();
        }
    }
}

export const isChrome = typeof chrome !== 'undefined';
export const browser = getBrowser();
