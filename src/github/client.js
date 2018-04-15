import { ApolloClient, ApolloError } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { CachePersistor } from 'apollo-cache-persist';
import bytes from 'bytes';

import { GITHUB_API } from '../constants';
import queryUserDetailsGQL from './queries/queryUserOrgDetails.gql';
import searchReposGQL from './queries/searchRepos.gql';

const memCache = new InMemoryCache({
    dataIdFromObject: object => object.id,
    addTypename: true,
});
const persistor = new CachePersistor({
    storage: window.localStorage,
    cache: memCache,
    maxSize: bytes('4MB'),
});

export class GithubError extends Error {
    static ErrorCodes = {
        UnknownError: "An unhandled error!",
        TokenAccess: "Your access token has improper access rights.",
    }
    constructor(message) {
        super(message);
        this.type = GithubError.Error.UnknownError;
    }
}

export class GithubClient {
    constructor(authKey) {
        if (!authKey) {
            throw new Error("Missing authKey for GithubClient");
        }
        this.apollo = new ApolloClient({
            link: new HttpLink({
                uri: GITHUB_API,
                headers: {
                    Authorization: `Bearer ${authKey}`,
                }
            }),
            cache: memCache,
        });
    }

    async fetchUserLogins() {
        const BATCH_SIZE = 2;
        try {
            let fetchDetails = true;
            let endCursor = null;
            const allLogins = [];
            while (fetchDetails) {
                const response = await this.apollo.query({
                    query: queryUserDetailsGQL,
                    variables: {
                        after: endCursor,
                        first: BATCH_SIZE
                    },
                });
                console.log(response);
                if (!allLogins.length) {
                    allLogins.push(response.data.viewer.login);
                }
                allLogins.push(...response.data.viewer.organizations.nodes.map(n => n.login));
                if (response.data.viewer.organizations.pageInfo.endCursor && allLogins.length >= BATCH_SIZE) {
                    endCursor = response.data.viewer.organizations.pageInfo.endCursor;
                } else {
                    fetchDetails = false;
                }
            }
            return allLogins;
        } catch (err) {
            if (err instanceof ApolloError) {
                throw new GIthubError(err.graphQLErrors[0].message);
            }
            throw err;
        }
    }

    async searchRepositories(text, userLogins = [], targets = ['name']) {
        const userAccess = userLogins.map(login => `user:${login}`).join(' ');
        const searchTargets = targets.map(target => `in:${target}`).join(' ');
        const searchTerm = `${text} ${searchTargets} ${userAccess}`;
        try {
            const response = await this.apollo.query({
                query: searchReposGQL,
                variables: {
                    searchTerm,
                    first: 10,
                }
            });
            const repos = response.data.search.edges;
            return repos.map(({ node: repo }) => ({
                name: repo.name,
                url: repo.url,
                organization: repo.owner.login,
            }))
        } catch (err) {
            if (err instanceof ApolloError) {
                throw new GIthubError(err.graphQLErrors[0].message);
            }
            throw err;
        }
    }
}
