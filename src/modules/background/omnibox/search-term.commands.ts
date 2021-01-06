import {SearchTermCommand} from './types/search-term';

/**
 * Handles `@username` commands
 */
export const atCommand: SearchTermCommand = {
    pattern: /@(?<scope>[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})/i,
    action: (matches) => {
        const {scope} = matches.groups ?? {};
        if (scope) {
            return {
                term: `user:${scope}`,
                replaceMatch: true,
            };
        }

        return undefined;
    },
};

/**
 * Parses # command to search for PRs
 */
export const prCommand: SearchTermCommand = {
    pattern: /^#/,
    action: () => {
        return {
            term: 'type:pr',
            replaceMatch: true,
        };
    },
};
