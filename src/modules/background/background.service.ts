import {injectable} from 'tsyringe';
import {RuntimeService} from '@core/browser';
import {GitHubClient} from '@core/github';
import {Logster} from '@core/logster';
import {StorageService} from '@core/storage';
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

    async bootstrap() {
        this.log.info('Bootstrap!');
        this.omniboxService.registerHandlers();

        this.storage.onKeysChanged('token').subscribe(async ({token}) => {
            if (token) {
                await this.storage.resetStorage();
                try {
                    const userData = await this.githubClient.fetchUserData(PAGE_SIZE);
                    const organizations = await this.githubClient.fetchUserOrganizations(PAGE_SIZE);
                    this.storage.saveLoginData(
                        userData.username,
                        userData.displayName,
                        organizations.map((o) => o.name),
                    );
                    this.storage.clearErrors();

                    this.storage.addRepositories(userData.repositories);

                    for (const org of organizations) {
                        const repos = await this.githubClient.fetchOrganizationRepositories(
                            org,
                            PAGE_SIZE,
                        );
                        this.storage.addRepositories(repos);
                    }
                } catch (err) {
                    this.log.error('Failed to validate token:', err);
                    this.storage.setErrors([
                        'Failed to fetch user data! Please make sure you are authenticated correctly!',
                    ]);
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
            const authToken = await this.githubClient.fetchAuthorizationToken(
                message.code,
                message.state,
            );
            this.storage.saveToken(authToken);
            this.log.info(`Should be authorized`);
        });
    }
}
