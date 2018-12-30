import {fetchAuthorizationToken, generateOAuthPageURL} from '../authorization';
import {GITHUB_OAUTH_URL, GITHUB_TOKEN_URL} from '../constants';

describe('GitHub authorization', () => {
    describe('generateOAuthPageURL', () => {
        test('returned string contains oauth URL', () => {
            expect(generateOAuthPageURL('test-state')).toContain(GITHUB_OAUTH_URL);
        });

        test('contains keys needed for auth', () => {
            const url = generateOAuthPageURL('test-state');
            expect(url).toContain('client_id=');
            expect(url).toContain('client_secret=');
        });

        test('contains state', () => {
            expect(generateOAuthPageURL('test-state')).toContain('state=test-state');
        });
    });

    describe('fetchAuthorizationToken', () => {
        beforeEach(() => {
            window.fetch = jest.fn();
        });

        test('calls the correct url', async () => {
            (window.fetch as jest.Mock).mockResolvedValueOnce({json: async () => ({access_token: 'test-token'})});

            await fetchAuthorizationToken('test-code');

            expect(window.fetch).toHaveBeenCalledTimes(1);
            expect(window.fetch).toHaveBeenCalledWith(expect.stringContaining(GITHUB_TOKEN_URL), {
                headers: {Accept: 'application/json'},
                method: 'POST',
            });
        });

        test('returns the access token', async () => {
            (window.fetch as jest.Mock).mockResolvedValueOnce({json: async () => ({access_token: 'test-token'})});

            expect(fetchAuthorizationToken('test-code')).resolves.toBe('test-token');
        });
    });
});
