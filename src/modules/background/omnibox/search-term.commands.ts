import {container} from 'tsyringe';
import {StorageService} from '../../../core/storage';
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
    handler: async () => {
        const storage = container.resolve(StorageService);
        const username = (await storage.getStorage()).username;
        return {
            term: `involves:${username} is:open`,
            arguments: {
                resultType: 'PR',
            },
        };
    },
};
