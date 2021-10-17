import {SuggestResult} from '@core/browser';
import {GitHubClient} from '@core/github';
import {Logster} from '@core/logster';
import {defer, Observable} from 'rxjs';
import {map, throttleTime} from 'rxjs/operators';
import {injectable, singleton} from 'tsyringe';
import {ResultType, SearchTerm} from '../../search-term/types/search-term';
import {BaseSuggester} from '../types/commands';

const SEARCH_DEBOUNCE_MS = 500;
const DEFAULT_REPOS_SIZE = 12;

@injectable()
@singleton()
export class GithubSuggester implements BaseSuggester {
    private readonly log = new Logster('GithubSuggester');

    constructor(private readonly githubClient: GitHubClient) {}

    suggest$(searchTerm: SearchTerm): Observable<SuggestResult[]> {
        return defer(() => {
            switch (searchTerm.resultType) {
                case ResultType.PullRequest:
                    return this.searchPullRequests$(searchTerm);
                case ResultType.Repository:
                default:
                    return this.searchRepositories$(searchTerm);
            }
        }).pipe(throttleTime(SEARCH_DEBOUNCE_MS));
    }

    private searchRepositories$(searchTerm: SearchTerm): Observable<SuggestResult[]> {
        return this.githubClient.searchRepositories$(searchTerm.term, DEFAULT_REPOS_SIZE).pipe(
            map((repositories) =>
                repositories.map(
                    (repo): SuggestResult => ({
                        content: repo.url,
                        description: `${repo.owner}/${repo.name} <url>${repo.url}</url>`,
                        deletable: true,
                    }),
                ),
            ),
        );
    }

    private searchPullRequests$(searchTerm: SearchTerm): Observable<SuggestResult[]> {
        return this.githubClient.searchPullRequests$(searchTerm.term, DEFAULT_REPOS_SIZE).pipe(
            map((issues) =>
                issues.map(
                    (issue): SuggestResult => ({
                        content: issue.url,
                        description: `<match>#${issue.number}</match>: ${issue.title.substr(0, 50)} <dim>by ${
                            issue.author
                        } in <match>${issue.repository}</match></dim>`,
                        deletable: true,
                    }),
                ),
            ),
            map((issues): SuggestResult[] => {
                if (!issues.length) {
                    return [
                        {
                            content: 'https://github.com/pulls',
                            description: `No matching results <dim>Open github.com/pulls</dim>`,
                            deletable: false,
                        },
                    ];
                }

                return issues;
            }),
        );
    }
}
