import { autorun, reaction } from 'mobx';

import { GithubClient } from '../github/client';
import { browser } from '../browser';
import { OptionsObservable as Options } from '../options/options.observable';
import { OPTION_STRINGS as OPTIONS } from '../constants';
import { onTextChangedFactory, onInputEnteredFactory } from './omnibox.handlers';

const onInputEntered = onInputEnteredFactory(browser);
let onTextChanged;

// Fetch logins when github token changes
reaction(
    () => Options[OPTIONS.GITHUB_TOKEN],
    async (token) => {
        if (!token) {
            return;
        }
        try {
            const client = new GithubClient(token);
            const logins = await client.fetchUserLogins();
            Options.setValue(OPTIONS.GITHUB_LOGINS, logins);
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
    if (!Options[OPTIONS.OPTIONS_SHOWN]) {
        Options.setValue(OPTIONS.SEARCH_NAME, true);
        Options.setValue(OPTIONS.SEARCH_FORKED, true);
        browser.runtime.openOptionsPage(() => {
            Options.setValue(OPTIONS.OPTIONS_SHOWN, true);
        });
    }
    if (!Options[OPTIONS.GITHUB_TOKEN]) {
        return;
    }
    unbindBackgroundHandlers(browser.omnibox);
    const client = new GithubClient(Options[OPTIONS.GITHUB_TOKEN]);
    onTextChanged = onTextChangedFactory(client, Options);
    bindBackgroundHandlers(browser.omnibox);
});
