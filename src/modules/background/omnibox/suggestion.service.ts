import {SuggestResult} from '@core/browser/omnibox.service';
import {GithubRepository} from '@core/github/types/repository';
import {Logster} from '@core/logster.service';
import Fuse from 'fuse.js';
import debounce from 'lodash.debounce';
import {injectable} from 'tsyringe';
import {GitHubClient} from '../../../core/github/github.client';
import {SearchTerm, SearchTermType} from './types/search-term';

@injectable()
export class SuggestionService {
    private readonly logster: Logster = new Logster('SuggestionService');
    private readonly fuse: Fuse<GithubRepository> = new Fuse([], {
        keys: [
            {name: 'name', weight: 0.7},
            {name: 'owner', weight: 0.3},
        ],
        includeMatches: true,
        shouldSort: true,
    });

    constructor(private readonly githubClient: GitHubClient) {}

    setCollection(repositories: GithubRepository[]) {
        this.logster.debug('Repositories change. Length:', repositories.length);
        this.fuse.setCollection(repositories);
    }

    async getSuggestions(searchTerm: SearchTerm): Promise<SuggestResult[]> {
        switch (searchTerm.type) {
            case SearchTermType.API:
                this.searchGitHubApi.cancel();
                return new Promise((resolve) => this.searchGitHubApi(searchTerm, 5)?.then(resolve));
            case SearchTermType.FromCache:
                return this.searchByFuseCache(searchTerm);
            case SearchTermType.Internal:
            default:
                return this.suggestInternal(searchTerm);
                break;
        }
    }

    private async searchByFuseCache(searchTerm: SearchTerm): Promise<SuggestResult[]> {
        console.log('searching in fuse');
        const fuseResults = this.fuse.search(searchTerm.term, {limit: 5});
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

    private searchGitHubApi = debounce(
        async (searchTerm: SearchTerm, limit = 5): Promise<SuggestResult[]> => {
            this.logster.info('Searching', searchTerm.term);
            const suggestions = await this.githubClient.searchRepositories(searchTerm.term, limit);

            return suggestions.map(
                (s): SuggestResult => ({
                    content: s.url,
                    description: searchTerm.formatter(`${s.owner}/${s.name}`),
                    deletable: true,
                }),
            );
        },
        500,
        {leading: true},
    );

    private async suggestInternal(searchTerm: SearchTerm): Promise<SuggestResult[]> {
        console.log('nothing internal yet');
        return [];
    }
}
