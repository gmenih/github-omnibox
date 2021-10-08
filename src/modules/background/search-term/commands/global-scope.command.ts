import {SearchCommand, SearchTermType} from '../types/search-term';

/**
 * Simply sets the `searchType` to be API, to make sure we search in GitHub, and
 * not our local cache. Does not anything to the search term.
 */
export class GlobalScopeCommand implements SearchCommand {
    searchType = SearchTermType.API;
    pattern = /!/;
}
