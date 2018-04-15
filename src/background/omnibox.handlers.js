import debounce from 'lodash/debounce';
import { browser } from '../browser';
import { SEARCH_DEBOUNCE } from '../constants';

/** @param {GithubClient} client
 * @param {chrome.omnibox} omnibox
*/
export const registerHandlers = (client, logins, omnibox) => {

    const textChangedHandler = debounce(async (text, suggest) => {
        try {
            const response = await client.searchRepositories(text, logins);

            suggest(response.map(repo => ({
                description: `${repo.organization}/${repo.name.replace(new RegExp(text, 'g'), `<match>${text}</match>`)}`,
                content: `${repo.url}`,
            })));
        } catch (err) {
            console.error('Error searching repos');
        }
    }, SEARCH_DEBOUNCE, { leading: true });

    const searchEnterHandler = (text, disposition) => {
        const url = text.startsWith('https://')
            ? text
            : `https://github.com/${text}`;

        switch (disposition) {
        case 'currentTab':
            return browser.tabs.update({ url });
        case 'newForegroundTab':
            return browser.tabs.create({ url });
        case 'newBackgroundTab':
        default:
            return browser.tabs.create({ url, active: false });
        }
    };

    omnibox.onInputChanged.addListener(textChangedHandler);
    omnibox.onInputEntered.addListener(searchEnterHandler);
};
