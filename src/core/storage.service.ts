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
    private readonly logster: Logster = new Logster('StorageService');

    constructor(private readonly browserStorage: BrowserStorageService<Storage>) {}

    getStorage(): Promise<Storage> {
        return this.browserStorage.getStorage();
    }

    onKeysChanged(): Observable<Storage>;
    onKeysChanged<TKey extends keyof Storage>(...keys: TKey[]): Observable<Pick<Storage, TKey>>;
    onKeysChanged<TKey extends keyof Storage>(...keys: TKey[]): Observable<Pick<Storage, TKey>> {
        return this.browserStorage.onChange().pipe(
            map(
                (value: Partial<Storage>): Pick<Storage, TKey> => {
                    if (keys.length === 0) {
                        return value as Pick<Storage, TKey>;
                    }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const entries: [TKey, any][] = (keys || []).map((key: TKey): [TKey, any] => [key, value[key]]);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const partialObject: Pick<Storage, TKey> = <Pick<Storage, TKey>>Object.fromEntries<any>(entries);

                    return partialObject;
                },
            ),
            distinctUntilChanged((a, b) => deepEqual(a, b)),
        );
    }

    saveLoginData(username: string, displayName: string, organizations: string[]): void {
        this.updateStorage({
            displayName: displayName,
            loggedIn: true,
            organizations: organizations || [],
            username: username,
        });
    }

    saveToken(token: string): void {
        this.updateStorage({
            token,
        });
    }

    saveRepositories(repositories: GithubRepository[]): void {
        this.updateStorage({
            repositories,
            lastRepoRefreshDate: new Date().toISOString(),
        });
    }

    /** Moves repo to the top so it will appear on the top of */
    increaseRepositoryFrequency(repoUrl: string): void {
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

    setOptionsShownDate(): void {
        this.updateStorage({
            optionsShown: Date.now(),
        });
    }

    shouldRefreshRepos() {
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
