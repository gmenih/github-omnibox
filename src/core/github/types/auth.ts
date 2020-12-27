export interface AuthorizationTokenResponse {
    access_token: string;
}

export interface GithubUserData {
    username: string;
    displayName: string;
    repositories: GithubRepository[];
}

export interface GitHubOrganizationData {
    name: string;
    repositories: GithubRepository[];
}
