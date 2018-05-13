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

reaction(
    () => options[OPTIONS.OPTIONS_SHOWN],
    (optionsShown) => {
        if (!optionsShown) {
            options.setValue(OPTIONS.SEARCH_NAME, true);
            options.setValue(OPTIONS.SEARCH_FORKED, true);
            browser.runtime.openOptionsPage(() => {
                options.setValue(OPTIONS.OPTIONS_SHOWN, true);
            });
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

reaction(
    () => options[OPTIONS.GITHUB_TOKEN],
    (token) => {
        if (!token) {
            return;
        }
        unbindBackgroundHandlers(browser.omnibox);
        const client = new GithubClient(token);
        onTextChanged = onTextChangedFactory(client, options);
        bindBackgroundHandlers(browser.omnibox);
    },
);
