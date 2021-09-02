import {RuntimeService} from '@core/browser';
import {AlarmsService} from '@core/browser/alarms.service';
import {GitHubClient} from '@core/github';
import {Logster} from '@core/logster';
import {StorageService} from '@core/storage';
import {injectable} from 'tsyringe';
import {AuthMessage} from '../content-script/types/message';
import {OmniboxService} from './omnibox/omnibox.service';

const PAGE_SIZE = 100;
const ALARM_NAME = 'daily-data-import';
const ALARM_PERIOD = 4 * 60; // 4 hours

@injectable()
export class BackgroundService {
    private readonly log: Logster = new Logster('BackgroundService');

    constructor(
        private readonly alarms: AlarmsService,
        private readonly githubClient: GitHubClient,
        private readonly omniboxService: OmniboxService,
        private readonly runtime: RuntimeService,
        private readonly storage: StorageService,
    ) {}

    async bootstrap() {
        this.log.info('Bootstrap!');
        this.omniboxService.registerHandlers();

        this.storage.onKeysChanged('token').subscribe(async ({token}) => {
            if (token) {
                await this.fetchAndStoreUserData();
                this.alarms.createPeriodicAlarm(ALARM_NAME, ALARM_PERIOD);
            } else {
                this.alarms.clearAll();
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

        this.alarms.onAlarmTriggered(ALARM_NAME).subscribe(async () => {
            this.log.info('Re-fetching user data.');
            await this.fetchAndStoreUserData();
        });
    }

    private async fetchAndStoreUserData() {
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
                const repos = await this.githubClient.fetchOrganizationRepositories(org, PAGE_SIZE);
                this.storage.addRepositories(repos);
            }
        } catch (err) {
            this.log.error('Failed to validate token:', err);
            this.storage.setErrors([
                'Failed to fetch user data! Please make sure you are authenticated correctly!',
            ]);
        }
    }
}
