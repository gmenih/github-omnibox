import {BrowserOmniboxService, EnteredDisposition, SuggestFn, SuggestResult} from '@core/browser';
import {TabsService} from '@core/browser/tabs.service';
import {Logster} from '@core/logster';
import {StorageService} from '@core/storage';
import {Observable} from 'rxjs';
import {first, map, mergeMap} from 'rxjs/operators';
import {injectable} from 'tsyringe';
import {SearchTermBuilder} from '../search-term/search-term.builder';
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
    ) {}

    registerHandlers() {
        this.omnibox
            .inputChanged$()
            .pipe(
                mergeMap(([input, suggest]) =>
                    this.storage.getStorage$().pipe(
                        first(),
                        mergeMap((storage) => {
                            const searchTerm = this.searchTermBuilder.buildSearchTerm(input, storage);
                            return this.suggestionService
                                .getSuggestions$(searchTerm)
                                .pipe(map((suggestions): [SuggestFn, SuggestResult[]] => [suggest, suggestions]));
                        }),
                    ),
                ),
            )
            .subscribe(([suggest, suggestions]) => {
                suggest(suggestions);
            });

        this.omnibox
            .inputEntered$()
            .pipe(mergeMap(([result, disposition]) => this.onInputEntered$(result, disposition)))
            .subscribe();

        // TODO: make it better
        // this.omnibox.inputStarted$().subscribe(() => {
        //     this.onInputStarted();
        // });
    }

    // TODO: handle internal commands
    private onInputEntered$(url: string, disposition: EnteredDisposition): Observable<void> {
        const isRepoUrl = url.startsWith('https://');
        const realUrl = isRepoUrl
            ? `${url}${this.urlModifier(disposition)}`
            : `https://github.com/search?q=${encodeURIComponent(url)}`;

        return this.storage.addToHistory$(url).pipe(mergeMap(() => this.tabsService.redirectSelectedTab$(realUrl)));
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
