import {GraphQLClient} from 'graphql-request';
import {DEFAULT_FIRST_REPOS} from '../constants';

interface RepositoryNode {
    node: {
        name: string;
        url: string;
        owner: {
            login: string;
        };
    };
}

interface SearchResponse {
    search: {
        edges: RepositoryNode[];
    };
}

export interface GithubRepository {
    name: string;
    owner: string;
    url: string;
}

export async function searchRepositories (
    githubClient: GraphQLClient,
    searchTerm: string,
    pageSize: number = DEFAULT_FIRST_REPOS,
): Promise<GithubRepository[]> {
    try {
        const response: SearchResponse = await githubClient.request<SearchResponse>(
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
            (edge): GithubRepository => ({
                name: edge.node.name,
                owner: edge.node.owner.login,
                url: edge.node.url,
            }),
        );
    } catch (err) {
        throw new Error('Failed to search repositories!');
    }
}
