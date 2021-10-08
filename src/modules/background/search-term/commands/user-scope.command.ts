import {HandlerResult, SearchCommand, SearchTermType} from '../types/search-term';

/**
 * Scopes the search results to a specific user or organization. Using `@octocat`
 * will only return results owned by `octocat`.
 */
export class UserScopeCommand implements SearchCommand {
    pattern = /@(?<scope>[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})/i;
    searchType: SearchTermType = SearchTermType.API;

    public handler(matches: RegExpMatchArray): HandlerResult | undefined {
        const {scope} = matches.groups ?? {};
        if (scope) {
            return {
                term: `user:${scope}`,
            };
        }

        return undefined;
    }
}
