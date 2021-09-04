import {ResultType, SearchCommand, SearchTermType} from '../types/search-term';

export class PullRequestCommand implements SearchCommand {
    pattern = /#/;
    searchType = SearchTermType.API;
    resultType = ResultType.PullRequest;

    /**
     * Is returns undefined as there is nothing to handle. We only set the
     * correct searchType and resultType. We also handle some stuff in the
     * postHandlers event.
     */
    handler(): undefined {
        return undefined;
    }

    postHandlers(terms: string[]): string[] {
        console.log('PR terms:', terms);

        return terms;
    }
}
