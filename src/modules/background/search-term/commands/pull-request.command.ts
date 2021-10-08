import {Storage} from '../../../../core/storage';
import {ResultType, SearchCommand, SearchTermType} from '../types/search-term';
import {GlobalScopeCommand} from './global-scope.command';
import {UserScopeCommand} from './user-scope.command';

/**
 * Will search for pull requests. If not accompanied by any scoped command (! or @),
 * it will only include open pull requests that include the current user.
 * If not combined with any other command, it will only include open pull requests
 * where the current user is "included" (e.g.; commented, requested a review, etc..)
 */
export class PullRequestCommand implements SearchCommand {
    pattern = /#/;
    searchType = SearchTermType.API;
    resultType = ResultType.PullRequest;

    postHandlers(terms: string[], matchedCommands: SearchCommand[], storage: Storage): string[] {
        const postTerms = Array.from(terms);
        if (this.noScopedCommands(matchedCommands)) {
            postTerms.push(`includes:${storage.username} is:open`);
        }

        return postTerms;
    }

    // Make sure there is no command which would scope the search, so we can
    // Include all organizations into the search.
    private noScopedCommands(matchedCommands: SearchCommand[]): boolean {
        return !matchedCommands.some((cmd) => cmd instanceof UserScopeCommand || cmd instanceof GlobalScopeCommand);
    }
}
