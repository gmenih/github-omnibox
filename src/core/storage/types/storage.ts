import {GithubRepository} from '../../github';

export interface Storage {
    displayName: string;
    isLoggedIn: boolean;
    optionsShown?: number;
    organizations: string[];
    lastRepoRefreshDate: string;
    repositories: GithubRepository[];
    token?: string;
    errors?: string[];
    username: string;
}
