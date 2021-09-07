import {BrowserOmniboxService, EnteredDisposition, SuggestFn, SuggestResult} from '@core/browser';
import {TabsService} from '@core/browser/tabs.service';
import {throttleTime, map, switchMap} from 'rxjs/operators';
import {Logster} from '@core/logster';
import {StorageService} from '@core/storage';
import {injectable} from 'tsyringe';
import {SearchTermBuilder} from '../search-term/search-term.builder';
import {QuickSuggester} from './suggester/quick.suggester';
import {SuggestionService} from './suggestion.service';

@injectable()
export class OmniboxService {
    private readonly log = new Logster('OmniboxService');

    constructor(
        private readonly omnibox: BrowserOmniboxService,
        private readonly storage: StorageService,
        private readonly tabsService: TabsService,
        private readonly searchTermBuilder: SearchTermBuilder,
        private readonly suggestionService: SuggestionService,
        private readonly quickSuggester: QuickSuggester,
    ) {}

    async registerHandlers() {
        this.storage.getStorage$().subscribe((storage) => {
            const repositories = storage.repositories ?? [];

            this.quickSuggester.setCollection(repositories);
            this.storage.onKeysChanged('repositories').subscribe(({repositories}) => {
                this.log.debug('Updating repositories');
                this.quickSuggester.setCollection(repositories ?? []);
            });
        });

        this.omnibox
            .inputChanged$()
            .pipe(
                switchMap(([input, suggest]) => {
                    const searchTerm = this.searchTermBuilder.buildSearchTerm(input);
                    return this.suggestionService
                        .getSuggestions$(searchTerm)
                        .pipe(map((suggestions): [SuggestFn, SuggestResult[]] => [suggest, suggestions]));
                }),
            )
            .subscribe(([suggest, suggestions]) => {
                suggest(suggestions);
            });

        this.omnibox.inputEntered$().subscribe(([result, disposition]) => {
            this.onInputEntered(result, disposition);
        });

        this.omnibox.inputStarted$().subscribe(() => {
            this.onInputStarted();
        });
    }

    private async onInputEntered(url: string, disposition: EnteredDisposition) {
        const isRepoUrl = url.startsWith('https://');
        const realUrl = isRepoUrl
            ? `${url}${this.urlModifier(disposition)}`
            : `https://github.com/search?q=${encodeURIComponent(url)}`;

        await this.tabsService.redirectSelectedTab(realUrl);
        this.storage.increaseRepositoryFrequency(url);
    }

    private onInputStarted() {
        this.omnibox.setDefaultSuggestion({
            description: 'Simple command line supported - type `?` for help',
        });
    }

    private urlModifier(disposition: chrome.omnibox.OnInputEnteredDisposition): string {
        // TODO: allow configuring this
        switch (disposition) {
            case 'newBackgroundTab':
                return '/pulls';
            case 'newForegroundTab':
                return '/issues';
            default:
                return '';
        }
    }
}
