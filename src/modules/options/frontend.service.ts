import {TabsService} from '@core/browser';
import {GitHubAuthClient} from '@core/github/github-auth.client';
import {Logster} from '@core/logster';
import {StorageService} from '@core/storage';
import {injectable} from 'tsyringe';

@injectable()
export class FrontendService {
    logger = new Logster('Frontend');

    constructor(
        private readonly githubClient: GitHubAuthClient,
        private readonly tabsService: TabsService,
        private readonly storageService: StorageService,
    ) {}

    createOAuthTab() {
        const url = this.githubClient.generateOAuthPageURL('69-69');
        this.logger.info(`Opening ${url}`);
        this.tabsService.createTab$(url);
    }

    async logOut() {
        await this.storageService.resetStorage();
    }

    async setTokenValue(token: string) {
        await this.storageService.resetStorage();
        await this.storageService.saveToken(token);
    }
}
