import {SearchCommand, SearchTermType} from '../types/search-term';

export class GlobalSearchCommand implements SearchCommand {
    searchType = SearchTermType.API;
    pattern = /!/;

    /**
     * We only set the `searchType` with this command.
     */
    handler(): undefined {
        return undefined;
    }
}
