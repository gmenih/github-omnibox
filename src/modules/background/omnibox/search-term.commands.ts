import {ResultType, SearchCommand, SearchTermType} from '../search-term/types/search-term';

/**
 * @<username> searcher for a username
 */
export const atCommand: SearchCommand = {
    type: SearchTermType.API,
    pattern: /@(?<scope>[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})/i,
    handler: (matches) => {
        const {scope} = matches.groups ?? {};
        if (scope) {
            return {
                term: `user:${scope}`,
            };
        }

        return undefined;
    },
};

/**
 * # searcher for PRs
 */
export const prCommand: SearchCommand = {
    pattern: /#/,
    type: SearchTermType.API,
    resultType: ResultType.PullRequest,
    handler: () => ({
        term: `involves:!%%USER%% is:open`,
    }),
};

/**
 * ! searches globally
 */
export const globalCommand: SearchCommand = {
    type: SearchTermType.API,
    pattern: /!/,
    // only set the type to API, so we don't search in cache
    handler: () => ({}),
};

export const helpCommand: SearchCommand = {
    type: SearchTermType.Internal,
    pattern: /\? ?(\w+)/,
    handler: (matches) => ({term: matches[1] ?? 'help'}),
};
