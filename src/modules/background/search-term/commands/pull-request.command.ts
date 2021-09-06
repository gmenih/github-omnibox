import {ResultType, SearchCommand, SearchTermType} from '../types/search-term';

export class PullRequestCommand implements SearchCommand {
    pattern = /#/;
    searchType = SearchTermType.API;
    resultType = ResultType.PullRequest;

    postHandlers(terms: string[]): string[] {
        console.log('PR terms:', terms);

        return terms;
    }
}
