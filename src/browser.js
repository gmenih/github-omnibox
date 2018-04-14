/** Return Chrome obj, as I don't know how to use web-ext-types :/
 * @returns {chrome}
 */
const getBrowser = () => {
    console.log('is chrome?', isChrome);
    if (isChrome) {
        return chrome;
    }
    return browser;
};

export const isChrome = typeof chrome !== 'undefined';
export const browser = getBrowser();
