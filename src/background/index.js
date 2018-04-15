import { registerHandlers, removeHandlers } from './omnibox.handlers';
import { GithubClient } from '../github/client';
import { browser, storageWrapper } from '../browser';
import { GITHUB_TOKEN, GITHUB_LOGINS } from '../constants';

const storage = storageWrapper(browser.storage.local);

const hookBackground = async () => {
    const githubToken = await storage.getItem(GITHUB_TOKEN);
    if (!githubToken) {
        console.log('No token present - exiting');
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
    if (Object.keys(changes).includes(GITHUB_TOKEN)) {
        console.log('Updated key - registering');
        hookBackground();
    }
});

hookBackground();
