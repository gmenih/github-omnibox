// import { browser } from '../browser';
// import { handleTextChanged } from './omnibox.handlers';

// console.log(browser);
// browser.omnibox.setDefaultSuggestion({
//     description: 'Github repo name',
// });

// browser.omnibox.onInputChanged.addListener(handleTextChanged)
import { GithubClient } from '../github/client';
import { browser, storageWrapper } from '../browser';

const storage = storageWrapper(browser.storage.local);

(async () => {
    const githubToken = await storage.getItem('__github.token');
    if (!githubToken) {
        console.log('No token present - exiting');
        return;
    }
    console.log('Token received - continuing');
    const client = new GithubClient(githubToken);
    try {
        const logins = await client.searchRepositories('pdp', ['equaleyes', 'erento']);
        console.log(logins);
    } catch (err) {
        console.error(err);
    }
})();
