import { debounce } from 'lodash';
import { GithubClient } from '../github/client';

/** @param {GithubClient} client
 * @param {chrome.omnibox} omnibox
*/
export const registerHandlers = (client, logins, omnibox) => {
    omnibox.setDefaultSuggestion({
        description: 'Enter repository name...',
    });

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
    }, 100, { leading: true });

    omnibox.onInputChanged.addListener(textChangedHandler);
};
