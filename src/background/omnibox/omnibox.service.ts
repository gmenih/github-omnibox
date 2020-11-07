import Fuse from 'fuse.js';
import debounce from 'lodash/debounce';
import {injectable, registry} from 'tsyringe';
import {BrowserOmniboxService, EnteredDisposition, SuggestFunction, SuggestResult} from '../../common/browser/omnibox.service';
import {TabsService} from '../../common/browser/tabs.service';
import {GitHubClient} from '../../common/github/github.client';
import {GithubRepository} from '../../common/github/types';
import {Logster} from '../../common/logster.service';
import {StorageService} from '../../common/storage.service';

@injectable()
@registry([
    {
        token: Fuse,
        useValue: new Fuse([], {
            keys: [
                {name: 'name', weight: 0.7},
                {name: 'owner', weight: 0.2},
            ],
            includeMatches: true,
            shouldSort: true,
        }),
    },
])
export class OmniboxService {
    private suggestions: SuggestResult[] = [];
    private readonly logster: Logster = new Logster('OmniboxService');

    constructor(
        private readonly fuse: Fuse<GithubRepository>,
        private readonly omnibox: BrowserOmniboxService,
        private readonly storage: StorageService,
        private readonly tabsService: TabsService,
    ) {}

    public registerHandlers(): void {
        this.storage.onKeysChanged('repositories').subscribe(({repositories}) => {
            this.logster.info('repos changed', repositories);
            this.fuse.setCollection(repositories);
        });

        const debouncedOnInputChanged = debounce(this.onInputChanged, 60, {leading: true});
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
        // const storage = this.storage.getStore();

        suggest(this.getHighlightedFuseSuggestions(text, 5));

        // suggest(results.map((result) => {
        //     return {

        //     }
        // }))
        // if (!storage.token) {
        //     return;
        // }
        // if (text.length < 3) {
        //     return;
        // }
        // const results = await this.githubClient.searchRepositories(text);
        // if (results && results.length) {
        //     this.suggestions = [
        //         ...results.map(
        //             (result): SuggestResult => ({
        //                 content: result.url,
        //                 description: `${result.owner}/${result.name}`,
        //             }),
        //         ),
        //         ...this.suggestions,
        //     ].slice(0, 5);
        // }
        suggest(this.suggestions);
    }

    private async onInputEntered(url: string, disposition: EnteredDisposition) {
        const isRepoUrl = url.startsWith('https://');
        const realUrl = isRepoUrl ? `${url}${this.urlModifier(disposition)}` : `https://github.com/search?q=${encodeURIComponent(url)}`;

        await this.tabsService.redirectSelectedTab(realUrl);
        if (isRepoUrl) {
            this.storage.increaseRepositoryFrequency(url);
        }
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
        this.logster.info(fuseResults);

        for (const result of fuseResults) {
            // for (const match of result.matches ?? []) {
            //     for (const [index, length] of match.indices) {
            //         const fuck = [
            //             match.value?.substr(0, index),
            //             '<match>',
            //             match.value?.substr(index, length),
            //             '</match>',
            //             match.value?.substr(index + length),
            //         ];
            //         consolefuck);
            //     }
            // }

            results.push({
                content: result.item.url,
                description: result.item.owner + '/' + result.item.name,
            });
        }

        return results;
    }
}
