import { registerHandlers } from './omnibox.handlers';
import { GithubClient } from '../github/client';
import { browser, storageWrapper } from '../browser';
import { OPTION_STRINGS as OPTIONS } from '../constants';

const storage = storageWrapper(browser.storage.local);

const hookBackground = async () => {
    const githubToken = await storage.getItem(OPTIONS.GITHUB_TOKEN);
    if (!githubToken) {
        const optionsShownOnce = await storage.getItem(OPTIONS.OPTIONS_SHOWN);
        console.log('No token present - exiting');
        if (!optionsShownOnce) {
            browser.runtime.openOptionsPage(() => {
                storage.setItem(OPTIONS.OPTIONS_SHOWN, true);
            });
        }
        return;
    }
    console.log('Token received - continuing');
    const client = new GithubClient(githubToken);
    try {
        const logins = await client.fetchUserLogins();
        console.log('Fetched most recent logins - continuing');
        registerHandlers(client, logins, browser.omnibox);
    } catch (err) {
        console.error(err);
    }
};

browser.storage.onChanged.addListener((changes, scope) => {
    if (scope !== 'local') {
        return;
    }
    if (Object.keys(changes).includes(OPTIONS.GITHUB_TOKEN)) {
        console.log('Updated key - registering');
        hookBackground();
    }
});

hookBackground();
