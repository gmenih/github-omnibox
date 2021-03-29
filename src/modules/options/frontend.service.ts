import {injectable} from 'tsyringe';
import {TabsService} from '@core/browser';
import {GitHubClient} from '@core/github';
import {Logster} from '@core/logster';
import {StorageService} from '@core/storage';

@injectable()
export class FrontendService {
    logger = new Logster('Frontend');

    constructor(
        private readonly githubClient: GitHubClient,
        private readonly tabsService: TabsService,
        private readonly storageService: StorageService,
    ) {}

    createOAuthTab() {
        const url = this.githubClient.generateOAuthPageURL('69-69');
        this.logger.info(`Opening ${url}`);
        this.tabsService.createTab(url);
    }

    async setTokenValue(token: string) {
        await this.storageService.resetStorage();
        await this.storageService.saveToken(token);
    }
}
