import {SearchResponse} from './search';

export interface PullRequestNode {
    title: string;
    number: string;
    url: string;
    author: {
        login: string;
    };
    repository: {
        nameWithOwner: string;
    };
}

export type PullRequestSearchResponse = SearchResponse<PullRequestNode>;

export interface GitHubPullRequest {
    title: string;
    number: number;
    author: string;
    repository: string;
    url: string;
}
