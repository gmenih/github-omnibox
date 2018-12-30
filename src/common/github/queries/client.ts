import {GraphQLClient} from 'graphql-request';
import {GITHUB_API} from '../constants';

export function createClient (token: string): GraphQLClient {
    return new GraphQLClient(GITHUB_API, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}
