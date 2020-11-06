import {injectable} from 'tsyringe';
import {RuntimeService} from '../common/browser/runtime.service';
import {GitHubClient} from '../common/github/github.client';
import {Logster} from '../common/logster.service';
import {StorageService} from '../common/storage.service';
import {OmniboxService} from './omnibox/omnibox.service';

const PAGE_SIZE = 100;

@injectable()
export class BackgroundService {
    constructor(
        private readonly storage: StorageService,
        private readonly githubClient: GitHubClient,
        private readonly omniboxService: OmniboxService,
        private readonly runtime: RuntimeService,
        private readonly log: Logster,
    ) {}

    public async bootstrap() {
        this.log.info('Bootstrap!');
        this.omniboxService.registerHandlers();

        this.storage.onKeysChanged('token').subscribe(async ({token}) => {
            if (token) {
                const userData = await this.githubClient.fetchUserData(PAGE_SIZE);
                const organizations = await this.githubClient.fetchUserOrganizations(PAGE_SIZE);

                if (this.storage.shouldRefreshRepos()) {
                    const allRepos = [...userData.repositories];
                    for (const org of organizations) {
                        const repos = await this.githubClient.fetchOrganizationRepositories(org, PAGE_SIZE);
                        allRepos.push(...repos);
                    }

                    this.storage.saveRepositories(allRepos);
                }

                this.storage.saveLoginData(
                    userData.username,
                    userData.displayName,
                    organizations.map((o) => o.name),
                );
            }
        });

        this.storage.onKeysChanged('optionsShown').subscribe(async ({optionsShown}) => {
            if (!optionsShown) {
                this.log.info('Opening options page');
                await this.runtime.openOptionsPage();
                this.storage.setOptionsShownDate();
            }
        });
    }
}
