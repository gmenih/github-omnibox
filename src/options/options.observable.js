import { observable } from 'mobx';

import { storageWrapper, browser } from '../browser';
import { OPTION_STRINGS as O } from '../constants';

const storage = storageWrapper(browser.storage.local);

export const OptionsObservable = observable({
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
    setValue(key, value) {
        this[key] = value;
        if (Object.values(O).some(x => x === key)) {
            console.log('updating setting');
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
    .then((values) => {
        Object.keys(values)
            .forEach((key) => {
                OptionsObservable.setValue(key, values[key]);
            });
    });
