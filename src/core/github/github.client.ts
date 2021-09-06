import {BehaviorSubject, Observable} from 'rxjs';
import {last, map, mergeMap, scan, takeWhile, tap} from 'rxjs/operators';
import {injectable, singleton} from 'tsyringe';
import {GitHubPullRequest, PullRequestSearchResponse} from '.';
import {Logster} from '../logster/logster.service';
import {DEFAULT_FIRST_RESULTS} from './github.const';
import {mapOrganizations, mapRepositories} from './github.mapper';
import {RxClient} from './rx.client';
import {GitHubOrganizationData, GithubUserData} from './types/auth';
import {
    GitHubOrgRepositoriesResponse,
    GithubRepository,
    GitHubUserDataResponse,
    GitHubUserOrgsResponse,
    SearchRepositoriesResponse,
} from './types/repository';

type CursedFetchFn<TResult> = (
    cursor: string | null,
    emitNext: BehaviorSubject<string | null>['next'],
) => Observable<TResult>;

type ScanningFn<TResult> = (acc: TResult, current: TResult) => TResult;

@injectable()
@singleton()
export class GitHubClient {
    private readonly log: Logster = new Logster('GithubClient');

    constructor(private readonly api: RxClient) {}

    fetchUserData$(pageSize = 100): Observable<GithubUserData> {
        return this.cursedLoop$(
            (cursor, nextCursor) =>
                this.api
                    .requestGQL<GitHubUserDataResponse>(
                        /* GraphQL */ `
                            query ($pageSize: Int!, $cursor: String) {
                                viewer {
                                    username: login
                                    name
                                    repositories(
                                        after: $cursor
                                        first: $pageSize
                                        affiliations: [OWNER, COLLABORATOR]
                                    ) {
                                        nodes {
                                            name
                                            url
                                            owner {
                                                name: login
                                            }
                                        }
                                        pageInfo {
                                            endCursor
                                        }
                                    }
                                }
                            }
                        `,
                        {
                            cursor,
                            pageSize,
                        },
                    )
                    .pipe(
                        tap((response) => nextCursor(response.viewer.repositories.pageInfo.endCursor ?? null)),
                        map(
                            (response): GithubUserData => ({
                                displayName: response.viewer.name,
                                username: response.viewer.username,
                                repositories: mapRepositories(response.viewer.repositories.nodes),
                            }),
                        ),
                    ),
            (acc, curr) => ({
                displayName: acc.displayName,
                username: acc.username,
                repositories: [...acc.repositories, ...curr.repositories],
            }),
        );
    }

    fetchUserOrganizations$(pageSize = 100): Observable<GitHubOrganizationData[]> {
        return this.cursedLoop$(
            (cursor, nextCursor) =>
                this.api
                    .requestGQL<GitHubUserOrgsResponse>(
                        /* GraphQL */ `
                            query ($pageSize: Int!, $cursor: String) {
                                viewer {
                                    organizations(after: $cursor, first: $pageSize) {
                                        nodes {
                                            name: login
                                        }
                                        pageInfo {
                                            endCursor
                                        }
                                    }
                                }
                            }
                        `,
                        {
                            cursor,
                            pageSize,
                        },
                    )
                    .pipe(
                        tap((response) =>
                            nextCursor(
                                response.viewer.organizations.nodes.length >= pageSize
                                    ? response.viewer.organizations.pageInfo.endCursor
                                    : null,
                            ),
                        ),
                        map((response) => mapOrganizations(response.viewer.organizations.nodes)),
                    ),
            (acc, curr) => ({
                ...acc,
                ...curr,
            }),
        );
    }

    fetchOrganizationRepositories$(org: GitHubOrganizationData, pageSize = 100): Observable<GithubRepository[]> {
        return this.cursedLoop$(
            (cursor, nextCursor) =>
                this.api
                    .requestGQL<GitHubOrgRepositoriesResponse>(
                        /* GraphQL */ `
                            query ($orgName: String!, $pageSize: Int!, $cursor: String) {
                                viewer {
                                    organization(login: $orgName) {
                                        repositories(after: $cursor, first: $pageSize) {
                                            nodes {
                                                name
                                                url
                                                nameWithOwner
                                            }
                                            pageInfo {
                                                endCursor
                                            }
                                        }
                                    }
                                }
                            }
                        `,
                        {
                            orgName: org.name,
                            pageSize,
                            cursor,
                        },
                    )
                    .pipe(
                        tap((response) =>
                            nextCursor(
                                response.viewer.organization.repositories.nodes.length >= pageSize
                                    ? response.viewer.organization.repositories.pageInfo.endCursor
                                    : null,
                            ),
                        ),
                        map((response) => mapRepositories(response.viewer.organization.repositories.nodes, org.name)),
                    ),
            (acc, curr) => [...acc, ...curr],
        );
    }

    searchRepositories$(searchTerm: string, pageSize = DEFAULT_FIRST_RESULTS): Observable<GithubRepository[]> {
        return this.api
            .requestGQL<SearchRepositoriesResponse>(
                /* GraphQL */ `
                    query searchRepos($searchTerm: String!, $pageSize: Int!) {
                        search(query: $searchTerm, first: $pageSize, type: REPOSITORY) {
                            edges {
                                node {
                                    ... on Repository {
                                        name
                                        url
                                        owner {
                                            login
                                        }
                                    }
                                }
                            }
                        }
                    }
                `,
                {
                    pageSize,
                    searchTerm,
                },
            )
            .pipe(
                map((response) => {
                    return response.search.edges.map((edge): GithubRepository => {
                        return {
                            name: edge.node.name,
                            owner: edge.node.owner.login,
                            url: edge.node.url,
                        };
                    });
                }),
            );
    }

    searchPullRequests$(searchTerm: string, pageSize = DEFAULT_FIRST_RESULTS): Observable<GitHubPullRequest[]> {
        return this.api
            .requestGQL<PullRequestSearchResponse>(
                /* GraphQL */ `
                    query ($searchTerm: String!, $pageSize: Int!) {
                        search(query: $searchTerm, first: $pageSize, type: ISSUE) {
                            edges {
                                node {
                                    ... on PullRequest {
                                        title
                                        number
                                        url
                                        author {
                                            login
                                        }
                                        repository {
                                            nameWithOwner
                                        }
                                    }
                                }
                            }
                        }
                    }
                `,
                {
                    pageSize,
                    searchTerm,
                },
            )
            .pipe(
                map((response) => {
                    return response.search.edges
                        .filter((edge) => !!edge.node.author)
                        .map((edge): GitHubPullRequest => {
                            return {
                                author: edge.node.author.login,
                                title: edge.node.title,
                                number: +edge.node.number,
                                repository: edge.node.repository.nameWithOwner,
                                url: edge.node.url,
                            };
                        });
                }),
            );
    }

    private cursedLoop$<TResult>(fetch$: CursedFetchFn<TResult>, scanningFn: ScanningFn<TResult>): Observable<TResult> {
        const cursor$ = new BehaviorSubject<string | null>('');

        const nextCursor = (value: string | null) => {
            if (value === null) {
                cursor$.next(null);
                cursor$.complete();
                return;
            }

            cursor$.next(value);
        };

        return cursor$.pipe(
            takeWhile((c) => c !== null),
            mergeMap((cursor) => fetch$(cursor || null, nextCursor)),
            scan<TResult, TResult>((result, current) => scanningFn(result, current)),
            last(),
        );
    }
}
