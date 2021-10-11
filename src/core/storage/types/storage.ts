import {GithubRepository} from '../../github';

export interface ResultHistory {
    url: string;
    clicks: number;
}

export interface Storage {
    isLoading: boolean;
    displayName: string;
    isLoggedIn: boolean;
    optionsShown?: number;
    organizations: string[];
    lastRepoRefreshDate: string;
    repositories: GithubRepository[];
    selectHistory: ResultHistory[];
    token?: string;
    errors?: string[];
    username: string;
}
