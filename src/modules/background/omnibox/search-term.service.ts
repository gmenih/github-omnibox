import {injectable} from 'tsyringe';

/**
 *
 * /command line
 * Commands:
 * /? - help (will suggest 5 texts)
 * /list - list recent repos
 * /code
 * /global [searchTerm] - global search
 * /pr
 * @\username [scoped user search]
 *
 */

interface SearchTermState {
    searchType: 'repo' | 'pr' | 'code';
    text: string;
    global: boolean;
}

@injectable()
export class SearchTermService {
    private static COMMANDS_MAP: Record<string, Partial<SearchTermState>> = {
        hoho: {},
    };

    build(): string {
        return '';
    }

    userScopesSearchTerm(...logins: string[]): string {
        return logins.map((login) => `user:${login}`).join(' ');
    }

    joinTerms(...args: Array<string | false>): string {
        return args.filter((arg) => typeof arg === 'string').join(' ');
    }

    generateSearchTerm(text: string): string {
        return this.joinTerms(text);
    }
}
