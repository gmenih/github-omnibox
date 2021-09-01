import {ResultType, SearchCommand, SearchTermType} from '../search-term/types/search-term';

/**
 * Allows scoping search by user when entering `@<username>`.
 * E.g.: `@gmenih341` will only show repositories from user `gmenih341`
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
 * Allows searching for pull requests. Currently unused due to `involves` issue.
 * TODO: Fix involves issue so it works well with other commands.
 * Also figure out targeting closed PRs?
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
 * Allows searching globally by adding `!` into your search command
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
