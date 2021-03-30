import {ResultType, SearchCommand, SearchTermType} from '../search-term/types/search-term';

/**
 * @<username> searcher for a username
 */
export const searchInUserScopeCommand: SearchCommand = {
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
 * Currently unused.. need to figure out how to solve the involve
 */
export const searchForPullRequestsCommand: SearchCommand = {
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
export const searchGloballyCommand: SearchCommand = {
    type: SearchTermType.API,
    pattern: /!/,
    // only set the type to API, so we don't search in cache
    handler: () => ({}),
};

export const helpCommand: SearchCommand = {
    type: SearchTermType.Internal,
    pattern: /^\?/,
    termMatch: 'full',
    handler: (matches) => ({term: matches[1] ?? 'help'}),
};
