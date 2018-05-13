import { autorun, reaction } from 'mobx';

import { GithubClient } from '../github/client';
import { browser } from '../browser';
import { options } from '../options.observable';
import { OPTION_STRINGS as OPTIONS } from '../constants';
import { onTextChangedFactory, onInputEnteredFactory } from './omnibox.handlers';

const onInputEntered = onInputEnteredFactory(browser);
let onTextChanged;

// Fetch logins when github token changes
reaction(
    () => options[OPTIONS.GITHUB_TOKEN],
    async (token) => {
        if (!token) {
            return;
        }
        try {
            const client = new GithubClient(token);
            const logins = await client.fetchUserLogins();
            options.setValue(OPTIONS.GITHUB_LOGINS, logins);
        } catch (err) {
            console.error('Error fetching User logins!');
            console.error(err.message);
        }
    },
);


const unbindBackgroundHandlers = (omnibox) => {
    if (typeof onTextChanged === 'function') {
        omnibox.onInputChanged.removeListener(onTextChanged);
    }
    if (typeof onItemSelected === 'function') {
        omnibox.onInputEntered.removeListener(onInputEntered);
    }
};

const bindBackgroundHandlers = (omnibox) => {
    omnibox.onInputChanged.addListener(onTextChanged);
    omnibox.onInputEntered.addListener(onInputEntered);
};

// Rebind listeners when state changes
autorun(async () => {
    console.log('autorun');
    if (!options[OPTIONS.OPTIONS_SHOWN]) {
        options.setValue(OPTIONS.SEARCH_NAME, true);
        options.setValue(OPTIONS.SEARCH_FORKED, true);
        browser.runtime.openOptionsPage(() => {
            options.setValue(OPTIONS.OPTIONS_SHOWN, true);
        });
    }
    if (!options[OPTIONS.GITHUB_TOKEN]) {
        return;
    }
    unbindBackgroundHandlers(browser.omnibox);
    const client = new GithubClient(options[OPTIONS.GITHUB_TOKEN]);
    onTextChanged = onTextChangedFactory(client, options);
    bindBackgroundHandlers(browser.omnibox);
});
