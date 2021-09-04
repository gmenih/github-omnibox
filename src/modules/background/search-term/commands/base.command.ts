import {injectable, registry} from 'tsyringe';
import {HandlerResult, SearchCommand, SearchTermType} from '../types/search-term';

export class BaseCommand implements SearchCommand {
    pattern = /.+/;
    searchType = SearchTermType.Quick;

    handler([firstMatch]: RegExpMatchArray): HandlerResult {
        return {
            term: firstMatch,
        };
    }
}
