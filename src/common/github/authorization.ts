import {CLIENT_ID, CLIENT_SECRET, DEFAULT_SCOPES, GITHUB_OAUTH_URL, GITHUB_TOKEN_URL} from './constants';
import {toQueryString} from './utils';

export function generateOAuthPageURL (state: string, scopes: string[] = DEFAULT_SCOPES): string {
    const query = toQueryString({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scopes: scopes.join(' '),
        state,
    });
    return `${GITHUB_OAUTH_URL}?${query}`;
}

interface AuthorizationTokenResponse {
    access_token: string;
}

export async function fetchAuthorizationToken (code: string): Promise<string> {
    const query = toQueryString({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
    });
    try {
        const response = await fetch(`${GITHUB_TOKEN_URL}?${query}`, {
            headers: {Accept: 'application/json'},
            method: 'POST',
        });
        const data: AuthorizationTokenResponse = await response.json();
        if (data && data.access_token) {
            return data.access_token;
        }
    } catch (err) {
        throw err;
    }
    throw new Error('Failed to authorize');
}
