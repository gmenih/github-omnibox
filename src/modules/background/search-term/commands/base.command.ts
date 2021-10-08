import {HandlerResult, SearchCommand, SearchTermType} from '../types/search-term';

/**
 * Base command that comes last. It simply returns the search string verbatim,
 * to make sure we handle the search term and search in the `Quick` storage
 */
export class BaseCommand implements SearchCommand {
    pattern = /.+/;
    searchType = SearchTermType.Quick;

    handler([firstMatch]: RegExpMatchArray): HandlerResult {
        return {
            term: firstMatch,
        };
    }
}
