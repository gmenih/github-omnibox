import debounce from 'lodash/debounce';
import { isChrome } from '../browser';
import { SEARCH_DEBOUNCE, OPTION_STRINGS } from '../constants';

const formatRepoName = (name, text) => (isChrome ? name.replace(text, `<match>${text}</match>`) : name);

export const onTextChangedFactory = (client, storage, { debounceTime = SEARCH_DEBOUNCE, ...options }) =>
    debounce(async (text, suggest) => {
        try {
            const logins = await storage.getItem(OPTION_STRINGS.GITHUB_LOGINS);
            const response = await client.searchRepositories(text, logins, { ...options });
            suggest(response.map(repo => ({
                description: `${repo.organization}/${formatRepoName(repo.name, text)}`,
                content: `${repo.url}`,
            })));
        } catch (err) {
            console.error('Error searching repos!');
            console.error(err);
        }
    }, debounceTime);

export const onEnterFactory = browser => (text, disposition) => {
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
