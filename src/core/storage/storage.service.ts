import deepEqual from 'deep-equal';
import {concat, Observable, ReplaySubject} from 'rxjs';
import {distinctUntilChanged, first, map, mergeMap, tap} from 'rxjs/operators';
import {injectable, singleton} from 'tsyringe';
import {BrowserStorageService} from '../browser';
import {GithubRepository} from '../github/types/repository';
import {Logster} from '../logster/logster.service';
import {Storage} from './types/storage';

const defaultStorage: Partial<Storage> = {
    repositories: [],
    selectHistory: [],
};

@injectable()
@singleton()
export class StorageService {
    private readonly logster: Logster = new Logster('StorageService');
    private readonly storage$: ReplaySubject<Storage> = new ReplaySubject(1, Infinity);

    constructor(private readonly browserStorage: BrowserStorageService<Storage>) {
        concat(this.browserStorage.getStorage$(), this.browserStorage.storageChanged$())
            .pipe(map((storage) => ({...defaultStorage, ...storage})))
            .subscribe(this.storage$);
    }

    keysChanged$<TKey extends keyof Storage>(...keys: TKey[]): Observable<Pick<Storage, TKey>> {
        return this.getStorage$().pipe(
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

    saveLoginData$(username: string, displayName: string, organizations: string[]) {
        return this.updateStorage$({
            displayName: displayName,
            isLoggedIn: true,
            organizations: organizations || [],
            username: username,
        });
    }

    setLoading$(isLoading: boolean) {
        return this.updateStorage$({isLoading});
    }

    saveToken$(token: string) {
        return this.updateStorage$({
            token,
        });
    }

    setErrors$(errors: string[]) {
        return this.updateStorage$({errors});
    }

    clearErrors$() {
        return this.updateStorage$({errors: []});
    }

    addRepositories$(newRepositories: GithubRepository[]) {
        return this.getStorageOnce$().pipe(
            mergeMap(({repositories}) => {
                const uniqueRepositories = new Set<GithubRepository>([...repositories, ...newRepositories]);

                this.logster.debug(`Saving ${repositories.length} repositories`);

                return this.saveRepositories$(Array.from(uniqueRepositories));
            }),
        );
    }

    resetStorage$() {
        return this.getStorageOnce$().pipe(
            mergeMap((value) => {
                const resetObj = Object.fromEntries(Object.entries(value).map(([key]) => [key, null]));

                return this.updateStorage$({...resetObj, ...defaultStorage});
            }),
        );
    }

    addToHistory$(url: string) {
        return this.getStorageOnce$().pipe(
            mergeMap(({selectHistory}) => {
                const targetIndex = selectHistory.findIndex((repo) => repo.url === url);

                if (targetIndex !== -1) {
                    selectHistory[targetIndex].clicks += 1;
                } else {
                    selectHistory.push({
                        url,
                        clicks: 1,
                    });
                }

                this.logster.debug(`Added ${url} to history`);

                return this.updateStorage$({selectHistory});
            }),
        );
    }

    setOptionsShownDate$() {
        return this.updateStorage$({
            optionsShown: Date.now(),
        });
    }

    saveRepositories$(repositories: GithubRepository[]) {
        // this.logster.debug('Setting repositories', repositories.length);
        return this.updateStorage$({
            repositories,
            lastRepoRefreshDate: new Date().toISOString(),
        });
    }

    sortRepositories$() {
        return this.getStorageOnce$().pipe(
            map(({selectHistory, repositories}) => {
                const historicRepos: GithubRepository[] = selectHistory
                    .sort((a, b) => b.clicks - a.clicks)
                    .map((history): GithubRepository | undefined =>
                        repositories.find((repository) => repository.url === history.url),
                    )
                    .filter((repo: GithubRepository | undefined): repo is GithubRepository => !!repo);

                return Array.from(new Set<GithubRepository>([...historicRepos, ...repositories]));
            }),
            tap((repositories) => this.logster.debug('Sorted repositories', repositories.length)),
            mergeMap((repositories) => this.updateStorage$({repositories})),
        );
    }

    getStorage$() {
        return this.storage$;
    }

    private updateStorage$(storage: Partial<Storage>): Observable<Storage> {
        return this.browserStorage.getStorage$().pipe(
            mergeMap((prevStorage) => this.browserStorage.updateStorage$({...prevStorage, ...storage})),
            mergeMap(() => this.browserStorage.getStorage$()),
        );
    }

    private getStorageOnce$() {
        return this.getStorage$().pipe(first());
    }
}
