import { observable } from 'mobx';

import { storageWrapper, browser } from './browser';
import { OPTION_STRINGS as O } from './constants';

const storage = storageWrapper(browser.storage.local);

export const options = observable({
    [O.GITHUB_TOKEN]: '',
    [O.GITHUB_LOGINS]: '',
    [O.SEARCH_NAME]: '',
    [O.SEARCH_DESC]: '',
    [O.SEARCH_LABEL]: '',
    [O.SEARCH_FORKED]: '',
    get authTokenSet() {
        return !!this[O.GITHUB_TOKEN];
    },
    getValue(key) {
        return this[key];
    },
    /** Will trigger browser storage change */
    setValue(key, value) {
        this[key] = value;
        if (Object.values(O).some(x => x === key)) {
            storage.setItem(key, value);
        }
    },
    clearOptions() {
        Object.keys(O)
            .forEach((key) => {
                this[O[key]] = '';
            });
    },
});

// Update state on startup
storage.getItems(null)
    .then(values =>
        Object.keys(values)
            .forEach((key) => {
                options[key] = values[key];
            }));

browser.storage.onChanged.addListener((changes) => {
    Object.keys(changes)
        .forEach((change) => {
            const { oldValue, newValue } = changes[change];
            if (oldValue === newValue) {
                return;
            }
            options[change] = newValue;
        });
});
