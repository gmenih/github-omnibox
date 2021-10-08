import {SuggestResult} from '@core/browser';
import {Observable} from 'rxjs';
import {injectable} from 'tsyringe';
import {SearchTerm, SearchTermType} from '../search-term/types/search-term';
import {GithubSuggester} from './suggester/github.suggester';
import {InternalSuggester} from './suggester/internal.suggester';
import {QuickSuggester} from './suggester/quick.suggester';
import {BaseSuggester} from './types/commands';

@injectable()
export class SuggestionService {
    private suggesterTypeMap: Map<SearchTermType, BaseSuggester>;

    constructor(
        githubSuggester: GithubSuggester,
        quickSuggester: QuickSuggester,
        internalSuggester: InternalSuggester,
    ) {
        this.suggesterTypeMap = new Map([
            [SearchTermType.API, githubSuggester],
            [SearchTermType.Quick, quickSuggester],
            [SearchTermType.Internal, internalSuggester],
        ]);
    }

    getSuggestions$(searchTerm: SearchTerm): Observable<SuggestResult[]> {
        return this.byType(searchTerm.type).suggest$(searchTerm);
    }

    private byType(searchTermType: SearchTermType): BaseSuggester {
        const suggester = this.suggesterTypeMap.get(searchTermType);
        if (!suggester) {
            throw new Error('Invalid search term!');
        }

        return suggester;
    }
}
