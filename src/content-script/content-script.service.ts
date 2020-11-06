import {injectable, inject} from 'tsyringe';
import {RuntimeService} from '../common/browser/runtime.service';
import {Logster, logsterRegistry} from '../common/logster.service';
import {WINDOW_TOKEN} from '../common/window.provider';

@injectable()
@logsterRegistry()
export class ContentScriptService {
    constructor(
        @inject(WINDOW_TOKEN) private readonly window: Window,
        private readonly logster: Logster,
        private readonly runtime: RuntimeService,
    ) {}

    public checkForLoginToken(): void {
        if (this.window.location.pathname === '/gmenih341/github-omnibox') {
            this.logster.info('Checking for login token presence', this.window.location);
            const queryString = this.parseQueryString(this.window.location.search);
            if ('code' in queryString && 'state' in queryString) {
                this.logster.info('State and code found!');
                this.runtime.sendMessage(queryString);
            }
        }
    }

    private parseQueryString(queryString: string): Record<string, string> {
        return Object.fromEntries(
            queryString
                .replace(/^\?/, '')
                .split('&')
                .map((pair) => pair.split('=').map((x) => decodeURIComponent(x))),
        );
    }
}
