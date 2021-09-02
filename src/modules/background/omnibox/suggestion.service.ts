import {SuggestResult} from '@core/browser';
import {injectable} from 'tsyringe';
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

    async getSuggestions(searchTerm: SearchTerm): Promise<SuggestResult[]> {
        switch (searchTerm.type) {
            case SearchTermType.API:
                return new Promise((resolve) =>
                    this.githubSuggester.suggest(searchTerm)?.then(resolve),
                );
            case SearchTermType.Quick:
                return this.quickSuggester.suggest(searchTerm);
            case SearchTermType.Internal:
            default:
                return this.internalSuggester.suggest(searchTerm);
        }
    }
}
