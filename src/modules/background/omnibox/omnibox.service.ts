import Fuse from 'fuse.js';
import * as debounce from 'lodash/debounce';
import {injectable} from 'tsyringe';
import {BrowserOmniboxService, EnteredDisposition, SuggestFunction, SuggestResult} from '../../../core/browser/omnibox.service';
import {TabsService} from '../../../core/browser/tabs.service';
import {GitHubClient} from '../../../core/github/github.client';
import {GithubRepository} from '../../../core/github/types/repository';
import {Logster} from '../../../core/logster.service';
import {StorageService} from '../../../core/storage.service';
import {atCommand, baseCommand, prCommand} from './searc-term.commands';
import {SearchTermBuilder} from './search-term.builder';
import {SearchTermBuildResponse} from './types/search-term';

@injectable()
export class OmniboxService {
    private readonly logster: Logster = new Logster('OmniboxService');
    private readonly fuse: Fuse<GithubRepository> = new Fuse([], {
        keys: [
            {name: 'name', weight: 0.7},
            {name: 'owner', weight: 0.2},
        ],
        includeMatches: true,
        shouldSort: true,
    });

    constructor(
        private readonly omnibox: BrowserOmniboxService,
        private readonly storage: StorageService,
        private readonly tabsService: TabsService,
        private readonly searchTermBuilder: SearchTermBuilder,
        private readonly githubClient: GitHubClient,
    ) {
        this.searchTermBuilder.withCommand(atCommand).withCommand(prCommand).withCommand(baseCommand);
    }

    public registerHandlers(): void {
        this.storage.onKeysChanged('repositories').subscribe(({repositories}) => {
            this.logster.info('repos changed', repositories);
            this.fuse.setCollection(repositories);
        });

        const debouncedOnInputChanged = debounce(this.onInputChanged, 500, {leading: true});
        this.omnibox.listenInputChanged(debouncedOnInputChanged.bind(this));

        this.omnibox.listenInputCancelled(this.onInputCancelled.bind(this));
        this.omnibox.listenDeleteSuggestion(this.onDeleteSuggestion.bind(this));
        this.omnibox.listenInputCancelled(this.onInputCancelled.bind(this));
        this.omnibox.listenInputEntered(this.onInputEntered.bind(this));
        this.omnibox.listenInputStarted(this.onInputStarted.bind(this));
    }

    private onDeleteSuggestion(): void {
        this.logster.warn('Not implemented yet');
    }

    private onInputCancelled(): void {
        this.logster.warn('Not implemented yet');
    }

    private async onInputChanged(text: string, suggest: SuggestFunction) {
        const searchTerm = this.searchTermBuilder.build(text);
        const suggestions = searchTerm.isCachable
            ? this.getHighlightedFuseSuggestions(searchTerm.term)
            : await this.getSearchByCommandSuggestions(searchTerm);

        suggest(suggestions);
    }

    private async onInputEntered(url: string, disposition: EnteredDisposition) {
        const isRepoUrl = url.startsWith('https://');
        const realUrl = isRepoUrl ? `${url}${this.urlModifier(disposition)}` : `https://github.com/search?q=${encodeURIComponent(url)}`;

        await this.tabsService.redirectSelectedTab(realUrl);
        // if (isRepoUrl) {
        //     this.storage.increaseRepositoryFrequency(url);
        // }
    }

    private onInputStarted(): void {
        this.omnibox.setDefaultSuggestion({
            description: 'Simple command line supported - type /? for more',
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

    private getHighlightedFuseSuggestions(text: string, limit = 5): SuggestResult[] {
        const fuseResults = this.fuse.search(text, {limit});
        const results: SuggestResult[] = [];

        for (const result of fuseResults) {
            results.push({
                content: result.item.url,
                description: result.item.owner + '/' + result.item.name,
                deletable: true,
            });
        }

        return results;
    }

    private async getSearchByCommandSuggestions(searchTerm: SearchTermBuildResponse, limit = 5): Promise<SuggestResult[]> {
        this.logster.info('Searching', searchTerm.term);
        const suggestions = await this.githubClient.searchRepositories(searchTerm.term, limit);

        return suggestions.map(
            (s): SuggestResult => ({
                content: s.url,
                description: searchTerm.formatter(`${s.owner}/${s.name}`),
                deletable: true,
            }),
        );
    }
}
