import {GithubRepository} from '../../github';

export interface Storage {
    displayName: string;
    loggedIn: boolean;
    optionsShown?: number;
    organizations: string[];
    lastRepoRefreshDate: string;
    repositories: GithubRepository[];
    token?: string;
    errors?: string[];
    username: string;
}
