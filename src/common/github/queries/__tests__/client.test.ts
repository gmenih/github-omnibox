import {GraphQLClient} from 'graphql-request';
import {createClient} from '../client';

describe('GitHub client', () => {
    test('creates a GraphQL client', () => {
        expect(createClient('test-token')).toBeInstanceOf(GraphQLClient);
    });
});
