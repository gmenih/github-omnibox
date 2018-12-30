import {GraphQLClient} from 'graphql-request';
import {DEFAULT_FIRST_LOGINS} from '../../constants';
import {fetchLogins} from '../fetchLogins';

const stubLoginsResponse = {
    viewer: {
        login: 'test-login',
        name: 'Test Name',
        organizations: {
            nodes: [
                {
                    login: 'test-organization-1',
                },
                {
                    login: 'test-organization-2',
                },
            ],
            pageInfo: {
                endCursor: 'end-cursor',
            },
        },
    },
};

describe('Github fetchLogins', () => {
    let mockGraphQLClient: GraphQLClient;

    beforeEach(() => {
        mockGraphQLClient = {
            request: jest.fn(),
        } as any;
    });

    test('query matches snapshot and is called with proper arguments', async () => {
        let calledQuery: string = '';
        (mockGraphQLClient.request as jest.Mock).mockImplementation((query: string) => {
            calledQuery = query;
            return stubLoginsResponse;
        });

        await fetchLogins(mockGraphQLClient);

        expect(mockGraphQLClient.request).toHaveBeenCalledTimes(1);
        expect(mockGraphQLClient.request).toHaveBeenCalledWith(expect.stringContaining('query'), {
            endCursor: null,
            pageSize: DEFAULT_FIRST_LOGINS,
        });
        expect(calledQuery).toMatchSnapshot();
    });

    test('maps data to GithubLogins interface', async () => {
        (mockGraphQLClient.request as jest.Mock).mockResolvedValueOnce(stubLoginsResponse);

        const result = await fetchLogins(mockGraphQLClient);

        expect(result).toMatchSnapshot();
    });
});
