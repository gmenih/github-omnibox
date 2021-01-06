import {injectable} from 'tsyringe';
import {RuntimeService} from '../../core/browser/runtime.service';
import {GitHubClient} from '../../core/github/github.client';
import {Logster} from '../../core/logster.service';
import {StorageService} from '../../core/storage.service';
import {AuthMessage} from '../content-script/types/message';
import {OmniboxService} from './omnibox/omnibox.service';

const PAGE_SIZE = 100;

@injectable()
export class BackgroundService {
    private readonly log: Logster = new Logster('BackgroundService');

    constructor(
        private readonly storage: StorageService,
        private readonly githubClient: GitHubClient,
        private readonly omniboxService: OmniboxService,
        private readonly runtime: RuntimeService,
    ) {}

    public async bootstrap() {
        this.log.info('Bootstrap!');
        this.omniboxService.registerHandlers();

        this.storage.onKeysChanged('token').subscribe(async ({token}) => {
            if (token) {
                const userData = await this.githubClient.fetchUserData(PAGE_SIZE);
                const organizations = await this.githubClient.fetchUserOrganizations(PAGE_SIZE);
                this.storage.saveLoginData(
                    userData.username,
                    userData.displayName,
                    organizations.map((o) => o.name),
                );

                this.storage.addRepositories(userData.repositories);

                for (const org of organizations) {
                    const repos = await this.githubClient.fetchOrganizationRepositories(org, PAGE_SIZE);
                    this.storage.addRepositories(repos);
                }
            }
        });

        this.storage.onKeysChanged('optionsShown').subscribe(async ({optionsShown}) => {
            if (!optionsShown) {
                this.log.info('Opening options page');
                await this.runtime.openOptionsPage();
                this.storage.setOptionsShownDate();
            }
        });

        this.runtime.onRuntimeMessage<AuthMessage>().subscribe(async ([message]) => {
            this.log.info(`Got an auth message, attempting to authorize`);
            const authToken = await this.githubClient.fetchAuthorizationToken(message.code, message.state);
            this.storage.saveToken(authToken);
            this.log.info(`Should be authorized`);
        });
    }
}
