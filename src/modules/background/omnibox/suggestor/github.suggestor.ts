import debounce from 'lodash.debounce';
import {injectable, singleton} from 'tsyringe';
import {SuggestResult} from '@core/browser';
import {GitHubClient} from '@core/github';
import {Logster} from '@core/logster';
import {ResultType, SearchTerm} from '../../search-term/types/search-term';

@injectable()
@singleton()
export class GithubSuggestor {
    private readonly log = new Logster('GithubSuggestor');

    constructor(private readonly githubClient: GitHubClient) {}

    public suggest = debounce(
        async (searchTerm: SearchTerm): Promise<SuggestResult[]> => {
            this.suggest.cancel();
            this.log.info('Searching', searchTerm.term, searchTerm);

            switch (searchTerm.resultType) {
                case ResultType.PullRequest:
                    return this.searchPullRequests(searchTerm);
                case ResultType.Repository:
                default:
                    return this.searchRepositories(searchTerm);
            }
        },
        500,
        {leading: true},
    );

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
