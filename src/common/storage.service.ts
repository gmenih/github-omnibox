import deepEqual from 'deep-equal';
import {Observable} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {injectable, singleton} from 'tsyringe';
import {BrowserStorageService} from './browser/browser-storage.service';
import {GithubRepository} from './github/types';
import {Logster} from './logster.service';

export interface Storage {
    displayName: string;
    loggedIn: boolean;
    optionsShown?: number;
    organizations: string[];
    lastRepoRefreshDate: string;
    repositories: GithubRepository[];
    token?: string;
    username: string;
}

const DAY_MS = 86400000;

@injectable()
@singleton()
export class StorageService {
    constructor(private readonly browserStorage: BrowserStorageService<Storage>, private readonly logster: Logster) {}

    public onKeysChanged<T extends keyof Storage>(...keys: T[]): Observable<Pick<Storage, T>> {
        return this.browserStorage.onChange().pipe(
            map(
                (value: Partial<Storage>): Pick<Storage, T> => {
                    const entries: [T, any][] = keys.map((key: T): [T, any] => [key, value[key]]);
                    const partialObject: Pick<Storage, T> = <Pick<Storage, T>>Object.fromEntries<any>(entries);

                    return partialObject;
                },
            ),
            distinctUntilChanged((a, b) => deepEqual(a, b)),
        );
    }

    public saveLoginData(username: string, displayName: string, organizations: string[]): void {
        this.updateStorage({
            displayName: displayName,
            loggedIn: true,
            organizations: organizations || [],
            username: username,
        });
    }

    public saveToken(token: string): void {
        this.updateStorage({
            token,
        });
    }

    public saveRepositories(repositories: GithubRepository[]): void {
        this.updateStorage({
            repositories,
            lastRepoRefreshDate: new Date().toISOString(),
        });
    }

    /** Moves repo to the top so it will appear on the top of */
    public increaseRepositoryFrequency(repoUrl: string): void {
        this.logster.info(`Increasing repo frequency for "${repoUrl}"`);
        const repositories = this.browserStorage.store?.repositories ?? [];
        const targetRepo = repositories.find((r) => r.url === repoUrl);
        if (!targetRepo) {
            this.logster.error(`Could not find repo "${repoUrl}"`);
            return;
        }

        const newRepositories = [targetRepo, ...repositories.filter((r) => r.url !== targetRepo.url)];
        this.updateStorage({repositories: newRepositories});
    }

    public setOptionsShownDate(): void {
        this.updateStorage({
            optionsShown: Date.now(),
        });
    }

    public shouldRefreshRepos() {
        const lastRefresh = this.browserStorage.store?.lastRepoRefreshDate;
        if (!lastRefresh) {
            return true;
        }

        const lastRefreshTimestamp = new Date(this.browserStorage.store?.lastRepoRefreshDate ?? 0).getTime();
        const now = Date.now();
        const delta = now - lastRefreshTimestamp;
        return delta > now - DAY_MS;
    }

    private async updateStorage(storage: Partial<Storage>) {
        await this.browserStorage.updateStorage(storage);
    }
}
