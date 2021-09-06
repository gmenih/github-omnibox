import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {injectable} from 'tsyringe';
import {AuthorizationTokenResponse} from '.';
import {Logster} from '../logster';
import {toQueryString} from '../utils/url.utils';
import {CLIENT_ID, CLIENT_SECRET, GITHUB_OAUTH_URL, GITHUB_SCOPES, GITHUB_TOKEN_URL} from './github.const';
import {RxClient} from './rx.client';

@injectable()
export class GitHubAuthClient {
    private log = new Logster('GitHubAuth');

    constructor(private readonly api: RxClient) {}

    generateOAuthPageURL(state: string, scopes: string[] = GITHUB_SCOPES): string {
        this.log.debug('Generating OAuth Page URL');
        const query = toQueryString({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            scope: scopes.join(' '),
            state: Math.random().toString(32).substring(2),
        });
        return `${GITHUB_OAUTH_URL}?${query}`;
    }

    fetchAuthorizationToken(code: string, state: string): Observable<string> {
        this.log.debug('Fetching authorization token');
        const query = toQueryString({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            state,
        });

        return this.api
            .fetch<AuthorizationTokenResponse>(`${GITHUB_TOKEN_URL}?${query}`, {
                headers: {Accept: 'application/json'},
                method: 'POST',
            })
            .pipe(
                filter((r) => !!r.access_token),
                map((r) => r.access_token),
            );
    }
}
