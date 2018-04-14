import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { CachePersistor } from 'apollo-cache-persist';
import gql from 'graphql-tag';
import bytes from 'bytes';

import { GITHUB_API } from './constants';
import { browser } from './browser';

const cache = new InMemoryCache();
const localCache = new CachePersistor({
    storage: browser.storage.local,
    maxSize: bytes('4.5MB'),
    cache,
});
const client = new ApolloClient({
    cache,
    link: new HttpLink({
        uri: GITHUB_API,
        headers: {
            Authorization: `Bearer 48a3b45d7bbbc036c3b5f871208edb1f281daa03`,
        }
    }),
});


client.query({
    query: gql`
    {
        viewer {
          organizations(first: 50){
            nodes {
              login,
              repositories(first:50) {
                nodes {
                  name,
                  url
                }
              }
            }
          }
        }
      }`
}).then(console.log)
.catch(console.err);
