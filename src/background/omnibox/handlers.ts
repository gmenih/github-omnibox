import debounce from 'lodash.debounce';
import {
    getSelectedTab,
    InputChangedCallback,
    InputEnteredCallback,
    redirectTab,
    setDefaulSuggestion,
    SuggestResult,
} from '../../common/browser';
import {createClient, searchRepositories} from '../../common/github/queries';
import {StorageObservable} from '../../common/storage';
import {generateSearchTerm} from './searchTerm';

const MIN_SEARCH_LENGTH = 3;
const MAX_RESULTS = 10;
const SEARCH_TIMEOUT = 150;

function urlModifier (disposition: chrome.omnibox.OnInputEnteredDisposition): string {
    switch (disposition) {
        case 'newBackgroundTab':
            return '/pulls';
        case 'newForegroundTab':
            return '/issues';
        default:
            return '';
    }
}

export const onInputStarted = (storage: StorageObservable): VoidCallback => () => {
    setDefaulSuggestion({
        description: 'Searching...',
    });
};

export const onInputChanged = (storage: StorageObservable): InputChangedCallback => {
    let suggestions: SuggestResult[] = [];
    const debouncedSearch = debounce<InputChangedCallback>(
        async (text, suggest) => {
            if (!storage.token || text.length < MIN_SEARCH_LENGTH) {
                debouncedSearch.cancel();
                return;
            }
            const results = await searchRepositories(createClient(storage.token), generateSearchTerm(text, storage));
            if (results && results.length) {
                suggestions = [
                    ...results.map(
                        (result): SuggestResult => ({
                            content: result.url,
                            description: `${result.owner}/${result.name}`,
                        }),
                    ),
                    ...suggestions,
                ].slice(0, MAX_RESULTS);
            }
            suggest(suggestions);
            debouncedSearch.cancel();
        },
        SEARCH_TIMEOUT,
        {
            trailing: true,
        },
    );
    return debouncedSearch;
};

export const onInputEntered = (storage: StorageObservable): InputEnteredCallback => async (url, disposition) => {
    const isRepoUrl = url.startsWith('https://');
    const realUrl = isRepoUrl
        ? `${url}${urlModifier(disposition)}`
        : `https://github.com/search?q=${encodeURIComponent(url)}`;

    redirectTab(await getSelectedTab(), realUrl);
};
