import {injectable} from 'tsyringe';
import {TabsService} from '../../core/browser/tabs.service';
import {GitHubClient} from '../../core/github/github.client';
import {Logster} from '../../core/logster.service';
import {StorageService} from '../../core/storage.service';

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
