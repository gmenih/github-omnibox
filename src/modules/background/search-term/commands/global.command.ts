import {SearchCommand, SearchTermType} from '../types/search-term';

export class GlobalSearchCommand implements SearchCommand {
    searchType = SearchTermType.API;
    pattern = /!/;
}
