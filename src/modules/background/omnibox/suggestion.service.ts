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
                return this.searchFuseCollection(searchTerm);
            case SearchTermType.Internal:
            default:
                return this.suggestInternal(searchTerm);
        }
    }

    private async searchFuseCollection(searchTerm: SearchTerm): Promise<SuggestResult[]> {
        console.log('searching in fuse', searchTerm);
        const fuseResults = this.fuse.search(searchTerm.term, {limit: 5});

        return fuseResults.map((fuseResult) => ({
            content: fuseResult.item.url,
            description: fuseResult.item.owner + '/' + fuseResult.item.name,
            deletable: true,
        }));
    }

    private searchGitHubApi = debounce(
        async (searchTerm: SearchTerm, limit = 5): Promise<SuggestResult[]> => {
            this.logster.info('Searching', searchTerm.term);

            if (searchTerm.arguments.resultType === 'REPO') {
                return this.searchRepositories(searchTerm);
            }

            return this.searchPullRequests(searchTerm);
        },
        500,
        {leading: true},
    );

    private async suggestInternal(searchTerm: SearchTerm): Promise<SuggestResult[]> {
        console.log('nothing internal yet');
        return [];
    }

    private async searchRepositories(searchTerm: SearchTerm): Promise<SuggestResult[]> {
        const repositories = await this.githubClient.searchRepositories(searchTerm.term, 5);
        return repositories.map(
            (s): SuggestResult => ({
                content: s.url,
                description: `${s.owner}/${s.name}`,
                deletable: true,
            }),
        );
    }

    private async searchPullRequests(searchTerm: SearchTerm): Promise<SuggestResult[]> {
        const repositories = await this.githubClient.searchPullRequests(searchTerm.term, 5);
        return repositories.map(
            (s): SuggestResult => ({
                content: s.url,
                description: `#${s.number}: ${s.title} by ${s.author} in ${s.repository}`,
                deletable: true,
            }),
        );
    }
}
