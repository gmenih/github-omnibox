import {injectable} from 'tsyringe';
import {TabsService} from '../common/browser/tabs.service';
import {GitHubClient} from '../common/github/github.client';
import {Logster} from '../common/logster.service';
import {StorageService} from '../common/storage.service';

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

    setTokenValue(token: string) {
        this.storageService.saveToken(token);
    }
}
