import {GraphQLClient} from 'graphql-request';
import {DEFAULT_FIRST_LOGINS} from '../constants';

interface OrganizationNode {
    login: string;
}

interface PageInfo {
    endCursor: string | null;
}

interface GithubViewerResponse {
    viewer: {
        login: string;
        name: string;
        organizations: {
            nodes: OrganizationNode[];
            pageInfo: PageInfo;
        };
    };
}

export interface GithubLogins {
    displayName?: string;
    organizations: string[];
    username: string;
}

export async function fetchLogins (
    githubClient: GraphQLClient,
    pageSize: number = DEFAULT_FIRST_LOGINS,
): Promise<GithubLogins> {
    let endCursor: string | null = null;
    let displayName: string | undefined;
    let username: string = '';
    const loginsSet: Set<string> = new Set();
    do {
        try {
            const response: GithubViewerResponse = await githubClient.request<GithubViewerResponse>(
                /* GraphQL */ `
                    query getUserInfo($pageSize: Int!, $endCursor: String) {
                        viewer {
                            login
                            name
                            organizations(after: $endCursor, first: $pageSize) {
                                nodes {
                                    login
                                }
                                pageInfo {
                                    endCursor
                                }
                            }
                        }
                    }
                `,
                {
                    endCursor,
                    pageSize,
                },
            );
            if (endCursor === null) {
                username = response.viewer.login;
                displayName = (response.viewer.name && response.viewer.name.split(' ')[0]) || undefined;
            }
            response.viewer.organizations.nodes.forEach(({login}) => {
                loginsSet.add(login);
            });
            if (response.viewer.organizations.nodes.length >= pageSize) {
                endCursor = response.viewer.organizations.pageInfo.endCursor;
            }
        } catch (error) {
            throw new Error('Could not fetch logins');
        }
    } while (endCursor !== null);
    return {
        displayName,
        organizations: [...loginsSet],
        username,
    };
}
