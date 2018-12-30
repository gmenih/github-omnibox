import {StorageObservable} from '../../common/storage';
import {clearFlags, parseFlags} from './flags';

function userScopesSearchTerm (...logins: string[]): string {
    return logins.map((login) => `user:${login}`).join(' ');
}

function joinTerms (...args: Array<string | false>): string {
    return args.filter((arg) => typeof arg === 'string').join(' ');
}

export function generateSearchTerm (text: string, storage: StorageObservable): string {
    const flags = parseFlags(text);
    return joinTerms(
        clearFlags(text),
        !flags.isGlobal && userScopesSearchTerm(storage.username, ...storage.organizations),
        !flags.excludeForks && 'fork:true',
    );
}
