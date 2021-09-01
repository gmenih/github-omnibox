import {BrowserOmniboxService, EnteredDisposition, SuggestFn} from '@core/browser';
import {TabsService} from '@core/browser/tabs.service';
import {Logster} from '@core/logster';
import {StorageService} from '@core/storage';
import debounce from 'lodash/debounce';
import {injectable, registry} from 'tsyringe';
import {SearchTermBuilder, searchTermFactory} from '../search-term/search-term.builder';
import {
    searchForPullRequestsCommand,
    searchGloballyCommand,
    searchInUserScopeCommand,
} from './search-term.commands';
import {SuggestionService} from './suggestion.service';
import {QuickSuggester} from './suggester/quick.suggester';

@registry([
    {
        token: SearchTermBuilder,
        useFactory: searchTermFactory(
            searchForPullRequestsCommand,
            searchInUserScopeCommand,
            searchGloballyCommand,
        ),
    },
])
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
        const repositories = (await this.storage.getStorage()).repositories ?? [];

        this.quickSuggester.setCollection(repositories);
        this.storage.onKeysChanged('repositories').subscribe(({repositories}) => {
            this.log.debug('Updating repositories');
            this.quickSuggester.setCollection(repositories ?? []);
        });

        const debouncedOnInputChanged = debounce(this.onInputChanged, 70, {leading: true});

        this.omnibox.listenInputChanged(debouncedOnInputChanged.bind(this));
        this.omnibox.listenInputEntered(this.onInputEntered.bind(this));
        this.omnibox.listenInputStarted(this.onInputStarted.bind(this));
    }

    private async onInputChanged(text: string, suggest: SuggestFn) {
        const searchTerm = await this.searchTermBuilder.buildSearchTerm(text);

        // await does not work here, because the methods inside are debounced
        // and will return undefined before getting the results sometimes
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
