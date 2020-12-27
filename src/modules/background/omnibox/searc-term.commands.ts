import {SearchTermCommand} from './types/search-term';

/**
 * Handles everything, should be the last command
 */
export const baseCommand: SearchTermCommand = {
    pattern: /.*/,
    action: (matches) => ({
        term: matches[0] ?? '',
    }),
};

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
                cleanedInput: matches.input.replace(matches[0], '').trim(),
            };
        }
    },
};

/**
 * Parses # command to search for PRs
 */
export const prCommand: SearchTermCommand = {
    pattern: /^#/,
    action: (matches) => {
        return {
            term: 'type:pr',
            cleanedInput: matches.input.replace(matches[0], '').trim(),
        };
    },
};
