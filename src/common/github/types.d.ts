export interface OrganizationNode {
    name: string;
}

export interface RepositoryNode {
    name: string;
    url: string;
    owner: {
        name: string;
    };
}

export interface GitHubUserDataResponse {
    viewer: {
        username: string;
        name: string;
        repositories: {
            nodes: RepositoryNode[];
            pageInfo: PageInfo;
        };
    };
}

export interface GitHubUserOrgsResponse {
    viewer: {
        organizations: {
            nodes: OrganizationNode[];
            pageInfo: PageInfo;
        };
    };
}

export interface GitHubOrgRepositoriesResponse {
    viewer: {
        organization: {
            repositories: {
                nodes: RepositoryNode[];
                pageInfo: PageInfo;
            }
        }
    }
}

interface PageInfo {
    endCursor: string | null;
}

interface GithubLogin {
    displayName?: string;
    organizations: string[];
    username: string;
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
