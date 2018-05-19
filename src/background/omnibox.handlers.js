import throttle from 'lodash/throttle';
import { isChrome } from '../browser';
import { SEARCH_DEBOUNCE, OPTION_STRINGS as OPTIONS } from '../constants';

const formatRepoName = (name, text) => {
    if (!isChrome) {
        return name;
    }
    const reg = new RegExp(text, 'i');
    const matches = name.match(reg);
    if (!matches) {
        return name;
    }
    return matches.reduce((out, curr) => out.replace(curr, `<match>${curr}</match>`), name);
};

const getTargetsFromSettings = (settings) => {
    const targets = [];
    if (settings[OPTIONS.SEARCH_DESC]) {
        targets.push('desc');
    }
    return targets;
};

export const onTextChangedFactory = (client, settings, { debounceTime = SEARCH_DEBOUNCE } = {}) => {
    const throttledSearch = throttle(async (text, suggest) => {
        const targets = getTargetsFromSettings(settings);
        const searchForks = !!settings[OPTIONS.SEARCH_FORKED];
        const userLogins = [];
        if (!settings[OPTIONS.SEARCH_GLOBAL]) {
            userLogins.push(...settings[OPTIONS.GITHUB_LOGINS]);
        }

        try {
            const response = await client.searchRepositories(
                text,
                userLogins,
                { targets, searchForks },
            );
            suggest(response.map(repo => ({
                description: `${repo.organization}/${formatRepoName(repo.name, text)}`,
                content: repo.url,
            })));
        } catch (err) {
            console.error('Error fetching repositories');
            console.error(err);
        }
    }, debounceTime);
    return (text, suggest) => {
        if (text.length < 2) {
            return;
        }
        throttledSearch(text, suggest);
    };
};

export const onInputEnteredFactory = browser => (text, disposition) => {
    const url = text.startsWith('https://')
        ? text
        : `https://github.com/search?q=${text}`;

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
