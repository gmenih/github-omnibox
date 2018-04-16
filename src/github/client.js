import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql/language/printer';

import { GITHUB_API } from '../constants';
import queryUserDetailsGQL from './queries/queryUserOrgDetails.gql';
import searchReposGQL from './queries/searchRepos.gql';

export class GithubClient {
    constructor(authKey) {
        if (!authKey) {
            throw new Error('Missing authKey for GithubClient');
        }
        this.client = new GraphQLClient(GITHUB_API, {
            headers: {
                Authorization: `Bearer ${authKey}`,
            },
        });
    }

    async fetchUserLogins() {
        const BATCH_SIZE = 100;
        try {
            let fetchDetails = true;
            let endCursor = null;
            const allLogins = [];
            while (fetchDetails) {
                const response = await this.client.request(print(queryUserDetailsGQL), {
                    after: endCursor,
                    first: BATCH_SIZE,
                });
                if (!allLogins.length) {
                    allLogins.push(response.viewer.login);
                }
                allLogins.push(...response.viewer.organizations.nodes.map(n => n.login));
                if (response.viewer.organizations.pageInfo.endCursor
                    && allLogins.length >= BATCH_SIZE
                ) {
                    ({ endCursor } = response.viewer.organizations.pageInfo);
                } else {
                    fetchDetails = false;
                }
            }
            return allLogins;
        } catch (err) {
            throw err;
        }
    }

    /** @returns {Promise<[{ name: string, url: string, organization: string }]>} */
    async searchRepositories(text, userLogins = [], targets = ['name']) {
        const userAccess = userLogins.map(login => `user:${login}`).join(' ');
        const searchTargets = targets.map(target => `in:${target}`).join(' ');
        const searchTerm = `${text} ${searchTargets} ${userAccess} fork:true`;
        try {
            const response = await this.client.request(print(searchReposGQL), {
                searchTerm,
                first: 10,
            });
            const repos = response.search.edges;
            return repos.map(({ node: repo }) => ({
                name: repo.name,
                url: repo.url,
                organization: repo.owner.login,
            }));
        } catch (err) {
            throw err;
        }
    }
}
