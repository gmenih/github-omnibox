import deepEqual from 'deep-equal';
import {Observable, BehaviorSubject} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {injectable, singleton} from 'tsyringe';
import {BrowserStorageService} from '../browser';
import {GithubRepository} from '../github/types/repository';
import {Logster} from '../logster/logster.service';
import {Storage} from './types/storage';

const DAY_MS = 86400000;

@injectable()
@singleton()
export class StorageService {
    private readonly logster: Logster = new Logster('StorageService');
    private storage$?: BehaviorSubject<Storage>;

    constructor(private readonly browserStorage: BrowserStorageService<Storage>) {
        this.browserStorage.onChange().subscribe((storage: Storage) => {
            if (!this.storage$) {
                this.storage$ = new BehaviorSubject(storage);
                return;
            }

            this.storage$.next(storage);
        });
    }

    getStorage$(): Observable<Storage> {
        return this.browserStorage.getStorage();
    }

    onKeysChanged(): Observable<Storage>;
    onKeysChanged<TKey extends keyof Storage>(...keys: TKey[]): Observable<Pick<Storage, TKey>>;
    onKeysChanged<TKey extends keyof Storage>(...keys: TKey[]): Observable<Pick<Storage, TKey>> {
        return this.browserStorage.onChange().pipe(
            map((value: Partial<Storage>): Pick<Storage, TKey> => {
                if (keys.length === 0) {
                    return value as Pick<Storage, TKey>;
                }
                const entries: [TKey, any][] = (keys || []).map((key: TKey): [TKey, any] => [key, value[key]]);
                const partialObject: Pick<Storage, TKey> = <Pick<Storage, TKey>>Object.fromEntries<any>(entries);

                return partialObject;
            }),
            distinctUntilChanged((a, b) => deepEqual(a, b)),
        );
    }

    saveLoginData(username: string, displayName: string, organizations: string[]) {
        this.updateStorage({
            displayName: displayName,
            isLoggedIn: true,
            organizations: organizations || [],
            username: username,
        });
    }

    saveToken(token: string) {
        this.updateStorage({
            token,
        });
    }

    saveRepositories(repositories: GithubRepository[]) {
        this.updateStorage({
            repositories,
            lastRepoRefreshDate: new Date().toISOString(),
        });
    }

    setErrors(errors: string[]) {
        this.updateStorage({errors});
    }

    clearErrors() {
        this.updateStorage({errors: []});
    }

    addRepositories(repositories: GithubRepository[]) {
        const existingRepositories = this.storage$?.value.repositories ?? [];
        const filteredUrls = existingRepositories.map((repo) => repo.url);
        const repositoriesToAdd = repositories.filter((repo) => !filteredUrls.includes(repo.url));
        if (repositoriesToAdd.length > 0) {
            this.saveRepositories([...existingRepositories, ...repositoriesToAdd]);
        }
    }

    resetStorage() {
        const resetObj = Object.fromEntries(Object.entries(this.storage$?.value ?? {}).map(([key]) => [key, null]));

        this.updateStorage(resetObj);
    }

    // TODO: make it work properly
    increaseRepositoryFrequency(repoUrl: string) {
        this.logster.debug(`Increasing repo frequency for "${repoUrl}"`);
        const repositories = this.storage$?.value.repositories ?? [];
        const targetRepo = repositories.find((r) => r.url === repoUrl);
        if (!targetRepo) {
            this.logster.debug('Repo not found - nothing to do.');
            return;
        }

        const newRepositories = [targetRepo, ...repositories.filter((r) => r.url !== targetRepo.url)];
        this.updateStorage({repositories: newRepositories});
    }

    setOptionsShownDate() {
        this.updateStorage({
            optionsShown: Date.now(),
        });
    }

    shouldRefreshRepos() {
        const lastRefresh = this.storage$?.value.lastRepoRefreshDate;
        if (!lastRefresh) {
            return true;
        }

        const lastRefreshTimestamp = new Date(this.storage$?.value.lastRepoRefreshDate ?? 0).getTime();
        const now = Date.now();
        const delta = now - lastRefreshTimestamp;
        return delta > now - DAY_MS;
    }

    private async updateStorage(storage: Partial<Storage>) {
        await this.browserStorage.updateStorage(storage);
    }
}
