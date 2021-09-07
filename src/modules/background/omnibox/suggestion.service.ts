import {SuggestResult} from '@core/browser';
import {injectable} from 'tsyringe';
import {defer, Observable} from 'rxjs';
import {throttleTime} from 'rxjs/operators';
import {SearchTerm, SearchTermType} from '../search-term/types/search-term';
import {GithubSuggester} from './suggester/github.suggester';
import {InternalSuggester} from './suggester/internal.suggester';
import {QuickSuggester} from './suggester/quick.suggester';

@injectable()
export class SuggestionService {
    constructor(
        private readonly githubSuggester: GithubSuggester,
        private readonly quickSuggester: QuickSuggester,
        private readonly internalSuggester: InternalSuggester,
    ) {}

    getSuggestions$(searchTerm: SearchTerm): Observable<SuggestResult[]> {
        return defer(() => {
            switch (searchTerm.type) {
                case SearchTermType.API:
                    return this.githubSuggester.suggest$(searchTerm).pipe(throttleTime(500));
                case SearchTermType.Quick:
                    return this.quickSuggester.suggest$(searchTerm);
                case SearchTermType.Internal:
                default:
                    return this.internalSuggester.suggest$(searchTerm);
            }
        });
    }
}
