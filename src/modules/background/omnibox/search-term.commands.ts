import {SearchCommand, SearchTermType} from './types/search-term';

/**
 * Handles `@username` commands
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
 * Parses # command to search for PRs
 */
export const prCommand: SearchCommand = {
    type: SearchTermType.API,
    pattern: /^#/,
    handler: () => {
        return {
            term: 'type:pr',
        };
    },
};
