import {BrowserOmniboxService, EnteredDisposition, SuggestFn} from '@core/browser/omnibox.service';
import {TabsService} from '@core/browser/tabs.service';
import {StorageService} from '@core/storage.service';
import * as debounce from 'lodash/debounce';
import {injectable, registry} from 'tsyringe';
import {SearchTermBuilder, searchTermFactory} from './search-term.builder';
import {atCommand, prCommand} from './search-term.commands';
import {SuggestionService} from './suggestion.service';

@registry([
    {
        token: SearchTermBuilder,
        useFactory: searchTermFactory(prCommand, atCommand),
    },
])
@injectable()
export class OmniboxService {
    constructor(
        private readonly omnibox: BrowserOmniboxService,
        private readonly storage: StorageService,
        private readonly tabsService: TabsService,
        private readonly searchTermBuilder: SearchTermBuilder,
        private readonly suggestionService: SuggestionService,
    ) {}

    registerHandlers() {
        console.log('listening');
        this.storage
            .onKeysChanged('repositories')
            .subscribe(({repositories}) => this.suggestionService.setCollection(repositories));

        const debouncedOnInputChanged = debounce(this.onInputChanged, 70, {leading: true});

        this.omnibox.listenInputChanged(debouncedOnInputChanged.bind(this));
        this.omnibox.listenInputEntered(this.onInputEntered.bind(this));
        this.omnibox.listenInputStarted(this.onInputStarted.bind(this));
    }

    private async onInputChanged(text: string, suggest: SuggestFn) {
        const searchTerm = this.searchTermBuilder.buildSearchTerm(text);

        this.suggestionService.getSuggestions(searchTerm).then(suggest);
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
            description: 'Simple command line supported - type `?` for more',
        });
    }

    private urlModifier(disposition: chrome.omnibox.OnInputEnteredDisposition): string {
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
