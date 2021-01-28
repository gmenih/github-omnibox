import {SuggestResult} from '@core/browser';
import {Logster} from '@core/logster';
import {injectable} from 'tsyringe';
import {SearchTerm, SearchTermType} from '../search-term/types/search-term';
import {GithubSuggestor} from './suggestor/github.suggestor';
import {InternalSuggestor} from './suggestor/internal.suggestor';
import {QuickSuggestor} from './suggestor/quick.suggestor';

@injectable()
export class SuggestionService {
    private readonly log: Logster = new Logster('SuggestionService');

    constructor(
        private readonly githubSuggestor: GithubSuggestor,
        private readonly quickSuggestor: QuickSuggestor,
        private readonly internalSuggestor: InternalSuggestor,
    ) {}

    async getSuggestions(searchTerm: SearchTerm): Promise<SuggestResult[]> {
        switch (searchTerm.type) {
            case SearchTermType.API:
                return new Promise((resolve) =>
                    this.githubSuggestor.suggest(searchTerm)?.then(resolve),
                );
            case SearchTermType.Quick:
                return this.quickSuggestor.suggest(searchTerm);
            case SearchTermType.Internal:
            default:
                return this.internalSuggestor.suggest(searchTerm);
        }
    }
}
