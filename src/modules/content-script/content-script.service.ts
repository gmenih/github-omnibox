import {injectable, inject} from 'tsyringe';
import {RuntimeService} from '@core/browser';
import {Logster} from '@core/logster';
import {WINDOW_TOKEN} from '@core/window';
import {AuthMessage} from './types/message';

const AUTH_TOKEN_PATH = '/gmenih341/github-omnibox/blob/main/.github/TOKEN.md';
@injectable()
export class ContentScriptService {
    private readonly logster: Logster = new Logster('ContentScript');

    constructor(
        @inject(WINDOW_TOKEN) private readonly window: Window,
        private readonly runtime: RuntimeService,
    ) {}

    checkForLoginToken() {
        if (this.window.location.pathname === AUTH_TOKEN_PATH) {
            this.logster.info('Checking for login token presence', this.window.location);
            const searchParams = this.parseQueryString(this.window.location.search);
            if (searchParams.has('code') && searchParams.has('state')) {
                const message: AuthMessage = {
                    code: <string>searchParams.get('code'),
                    state: <string>searchParams.get('state'),
                };
                this.runtime.sendMessage(message);
            }
        }
    }

    private parseQueryString(queryString: string): URLSearchParams {
        return new URLSearchParams(queryString);
    }
}
