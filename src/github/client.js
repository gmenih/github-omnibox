import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { CachePersistor } from 'apollo-cache-persist';
import bytes from 'bytes';

import { browser } from '../browser';
import { GITHUB_API } from '../constants';

/** @returns {ApolloClient} */
export const client = (authKey) => {
    const memCache = new InMemoryCache();
    return new ApolloClient({
        link: new HttpLink({
            uri: GITHUB_API,
            headers: {
                Authorization: `Bearer ${authKey}`,
            }
        }),
        cache: memCache,
    });
}
