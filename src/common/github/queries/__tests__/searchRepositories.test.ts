import {GraphQLClient} from 'graphql-request';
import {DEFAULT_FIRST_REPOS} from '../../constants';
import {searchRepositories} from '../searchRepositories';

const stubRepositoriesResponse = {
    search: {
        edges: [
            {
                node: {
                    name: 'test-repo',
                    owner: {
                        login: 'test-user',
                    },
                    url: 'https://github.com/test/repo',
                },
            },
        ],
    },
};

describe('Github searchRepositories', () => {
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
            return stubRepositoriesResponse;
        });

        await searchRepositories(mockGraphQLClient, 'test term');

        expect(mockGraphQLClient.request).toHaveBeenCalledTimes(1);
        expect(mockGraphQLClient.request).toHaveBeenCalledWith(expect.stringContaining('query'), {
            pageSize: DEFAULT_FIRST_REPOS,
            searchTerm: 'test term',
        });
        expect(calledQuery).toMatchSnapshot();
    });

    test('maps data to GithubRepository interface', async () => {
        (mockGraphQLClient.request as jest.Mock).mockResolvedValueOnce(stubRepositoriesResponse);

        const result = await searchRepositories(mockGraphQLClient, 'test term');

        expect(result).toMatchSnapshot();
    });
});
