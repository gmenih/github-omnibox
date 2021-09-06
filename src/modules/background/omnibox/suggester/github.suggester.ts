import {SuggestResult} from '@core/browser';
import {GitHubClient} from '@core/github';
import {Logster} from '@core/logster';
import {defer, Observable} from 'rxjs';
import {debounceTime, map} from 'rxjs/operators';
import {injectable, singleton} from 'tsyringe';
import {ResultType, SearchTerm} from '../../search-term/types/search-term';

@injectable()
@singleton()
export class GithubSuggester {
    private readonly log = new Logster('GithubSuggester');

    constructor(private readonly githubClient: GitHubClient) {}

    suggest$(searchTerm: SearchTerm): Observable<SuggestResult[]> {
        return defer(() => {
            switch (searchTerm.resultType) {
                case ResultType.PullRequest:
                    return this.searchPullRequests(searchTerm);
                case ResultType.Repository:
                default:
                    return this.searchRepositories(searchTerm);
            }
        }).pipe(debounceTime(500));
    }

    private searchRepositories(searchTerm: SearchTerm): Observable<SuggestResult[]> {
        return this.githubClient.searchRepositories$(searchTerm.term, 5).pipe(
            map((repositories) =>
                repositories.map(
                    (repo): SuggestResult => ({
                        content: repo.url,
                        description: `${repo.owner}/${repo.name}`,
                        deletable: true,
                    }),
                ),
            ),
        );
    }

    private searchPullRequests(searchTerm: SearchTerm): Observable<SuggestResult[]> {
        return this.githubClient.searchPullRequests$(searchTerm.term, 5).pipe(
            map((issues) =>
                issues.map(
                    (issue): SuggestResult => ({
                        content: issue.url,
                        description: `#${issue.number}: ${issue.title} by ${issue.author} in ${issue.repository}`,
                        deletable: true,
                    }),
                ),
            ),
        );
    }
}
