import {GraphQLClient} from 'graphql-request';
import {injectable, singleton} from 'tsyringe';
import {Logster} from '../logster.service';
import {StorageService} from '../storage.service';
import {
    CLIENT_ID,
    CLIENT_SECRET,
    DEFAULT_SCOPES,
    GITHUB_API,
    GITHUB_OAUTH_URL,
    DEFAULT_FIRST_RESULTS,
    GITHUB_TOKEN_URL,
} from './constants';
import {AuthorizationTokenResponse, GitHubOrganizationData, GithubUserData} from './types/auth';
import {GitHubPullRequest, PullRequestSearchResponse} from './types/pull-request';
import {
    GitHubOrgRepositoriesResponse,
    GithubRepository,
    GitHubUserDataResponse,
    GitHubUserOrgsResponse,
    OrganizationNode,
    RepositoryNode,
    SearchRepositoriesResponse,
} from './types/repository';
import {SearchResponse} from './types/search';
import {toQueryString} from './utils';

@injectable()
@singleton()
export class GitHubClient {
    private static lastCreated?: number;
    private gqlClient!: GraphQLClient;
    private readonly logster: Logster = new Logster('GithubClient');

    constructor(private readonly storage: StorageService) {
        this.storage.onKeysChanged('token').subscribe(({token}) => {
            if (token) {
                if (GitHubClient.lastCreated && Date.now() - GitHubClient.lastCreated < 5) {
                    this.logster.warn('Detected repeat creation');
                    debugger;
                }
                GitHubClient.lastCreated = Date.now();
                this.logster.info(`Creating GithubClient for token "${token}"`);
                this.gqlClient = new GraphQLClient(GITHUB_API, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        });
    }

    generateOAuthPageURL(state: string, scopes: string[] = DEFAULT_SCOPES): string {
        this.logster.info('Generating OAuth URL');
        const query = toQueryString({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            scope: scopes.join(' '),
            state: Math.random().toString(32).substring(2),
        });
        return `${GITHUB_OAUTH_URL}?${query}`;
    }

    async fetchAuthorizationToken(code: string, state: string): Promise<string> {
        this.logster.info('Fetching auth token');
        const query = toQueryString({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            state,
        });

        try {
            const response = await fetch(`${GITHUB_TOKEN_URL}?${query}`, {
                headers: {Accept: 'application/json'},
                method: 'POST',
            });
            const data: AuthorizationTokenResponse = await response.json();
            if (data && data.access_token) {
                this.logster.info('Authorization token received!');
                return data.access_token;
            }
            this.logster.error('Access token missing in response!');
        } catch (err) {
            this.logster.error('Failed to fetch authorization! Error:', err);
        }

        throw new Error('Failed to authorize');
    }

    async fetchUserData(pageSize = 100): Promise<GithubUserData> {
        const userData: GithubUserData = {repositories: [], displayName: '', username: ''};
        let repoCur: string | null = null;
        do {
            try {
                const response: GitHubUserDataResponse = await this.gqlClient.request(
                    /* GraphQL */ `
                        query($pageSize: Int!, $repoCur: String) {
                            viewer {
                                username: login
                                name
                                repositories(
                                    after: $repoCur
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
                        repoCur,
                        pageSize,
                    },
                );

                userData.displayName = response.viewer.name;
                userData.username = response.viewer.username;
                userData.repositories.push(
                    ...this.mapRepositories(response.viewer.repositories.nodes),
                );

                repoCur = null;
                if (response.viewer.repositories.nodes.length >= pageSize) {
                    repoCur = response.viewer.repositories.pageInfo.endCursor;
                }
            } catch (error) {
                throw new Error(`Could not fetch user data! Error: ${error.toString()}`);
            }
        } while (repoCur !== null);

        return userData;
    }

    async fetchUserOrganizations(pageSize = 100): Promise<GitHubOrganizationData[]> {
        const organizations: GitHubOrganizationData[] = [];
        let orgCursor: string | null = null;
        do {
            try {
                const response: GitHubUserOrgsResponse = await this.gqlClient.request(
                    /* GraphQL */ `
                        query($pageSize: Int!, $orgCursor: String) {
                            viewer {
                                organizations(after: $orgCursor, first: $pageSize) {
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
                        orgCursor,
                        pageSize,
                    },
                );

                organizations.push(...this.mapOrganizations(response.viewer.organizations.nodes));

                orgCursor = null;
                if (response.viewer.organizations.nodes.length >= pageSize) {
                    orgCursor = response.viewer.organizations.pageInfo.endCursor;
                }
            } catch (error) {
                throw new Error(`Could not fetch organizations! Error: ${error.toString()}`);
            }
        } while (orgCursor);

        return organizations;
    }

    async fetchOrganizationRepositories(
        org: GitHubOrganizationData,
        pageSize = 100,
    ): Promise<GithubRepository[]> {
        const repositories: GithubRepository[] = [];
        let repoCur: string | null = null;
        do {
            try {
                const response: GitHubOrgRepositoriesResponse = await this.gqlClient.request(
                    /* GraphQL */ `
                        query($orgName: String!, $pageSize: Int!, $repoCur: String) {
                            viewer {
                                organization(login: $orgName) {
                                    repositories(after: $repoCur, first: $pageSize) {
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
                        repoCur,
                    },
                );

                repositories.push(
                    ...this.mapRepositories(
                        response.viewer.organization.repositories.nodes,
                        org.name,
                    ),
                );

                repoCur = null;
                if (response.viewer.organization.repositories.nodes.length >= pageSize) {
                    repoCur = response.viewer.organization.repositories.pageInfo.endCursor;
                }
            } catch (error) {
                throw new Error(
                    `Could not fetch organization repositories! Error: ${error.toString()}`,
                );
            }
        } while (repoCur);

        return repositories;
    }

    async searchRepositories(
        searchTerm: string,
        pageSize: number = DEFAULT_FIRST_RESULTS,
    ): Promise<GithubRepository[]> {
        if (!searchTerm) {
            throw new Error('searchTerm must be set!');
        }

        try {
            const response: SearchRepositoriesResponse = await this.gqlClient.request(
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
            );
            return response.search.edges.map(
                (edge): GithubRepository => {
                    return {
                        name: edge.node.name,
                        owner: edge.node.owner.login,
                        url: edge.node.url,
                    };
                },
            );
        } catch (err) {
            throw new Error('Failed to search repositories!');
        }
    }

    async searchPullRequests(
        searchTerm: string,
        pageSize: number = DEFAULT_FIRST_RESULTS,
    ): Promise<GitHubPullRequest[]> {
        if (!searchTerm) {
            throw new Error('searchTerm must be set!');
        }

        try {
            const response: PullRequestSearchResponse = await this.gqlClient.request(
                /* GraphQL */ `
                    query($searchTerm: String!, $pageSize: Int!) {
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
            );
            return response.search.edges.map(
                (edge): GitHubPullRequest => {
                    return {
                        author: edge.node.author.login,
                        title: edge.node.title,
                        number: +edge.node.number,
                        repository: edge.node.repository.nameWithOwner,
                        url: edge.node.url,
                    };
                },
            );
        } catch (err) {
            throw new Error('Failed to search repositories!');
        }
    }

    private mapRepositories(nodes: RepositoryNode[], ownerName?: string): GithubRepository[] {
        return nodes.map((node) => {
            return {
                name: node.name,
                owner: ownerName ? ownerName : node.owner.name,
                url: node.url,
            };
        });
    }

    private mapOrganizations(nodes: OrganizationNode[]): GitHubOrganizationData[] {
        return nodes.map((node) => {
            return {
                name: node.name,
                repositories: [],
            };
        });
    }
}
