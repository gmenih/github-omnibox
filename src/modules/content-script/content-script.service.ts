import {injectable, inject} from 'tsyringe';
import {RuntimeService} from '../../core/browser/runtime.service';
import {Logster} from '../../core/logster.service';
import {WINDOW_TOKEN} from '../../core/window.provider';
import {AuthMessage} from './types/message';

@injectable()
export class ContentScriptService {
    private readonly logster: Logster = new Logster('ContentScript');

    constructor(@inject(WINDOW_TOKEN) private readonly window: Window, private readonly runtime: RuntimeService) {}

    checkForLoginToken() {
        if (this.window.location.pathname === '/gmenih341/github-omnibox') {
            this.logster.info('Checking for login token presence', this.window.location);
            const queryString = this.parseQueryString(this.window.location.search);
            if ('code' in queryString && 'state' in queryString) {
                const message: AuthMessage = {
                    code: queryString.code,
                    state: queryString.state,
                };
                this.runtime.sendMessage(message);
            }
        }
    }

    private parseQueryString(queryString: string): Record<string, string> {
        return Object.fromEntries(
            queryString
                .replace(/^\?/, '')
                .split('&')
                .map((pair: string): string[] => pair.split('=').map((x) => decodeURIComponent(x))),
        );
    }
}
