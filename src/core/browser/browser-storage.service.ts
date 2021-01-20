import deepEqual from 'deep-equal';
import {Observable, Subject, BehaviorSubject} from 'rxjs';
import {inject, injectable, registry} from 'tsyringe';
import {Logster} from '../logster.service';
import {Browser, BROWSER_TOKEN} from './browser.provider';

const BROWSER_STORAGE_TYPE = Symbol('storage-token');

@injectable()
@registry([
    {
        token: BROWSER_STORAGE_TYPE,
        useValue: 'local',
    },
])
export class BrowserStorageService<T> {
    store?: T;
    private storageChanged$: Subject<T> = new Subject();
    private chromeStorage: chrome.storage.StorageArea;
    private readonly logster: Logster = new Logster('BrowserStorageService');

    constructor(
        @inject(BROWSER_TOKEN) private readonly browser: Browser,
        @inject(BROWSER_STORAGE_TYPE) storageType: 'local',
    ) {
        this.chromeStorage = this.browser.storage[storageType];
        this.onStorageChange();
        this.loadInitialValue();
    }

    async updateStorage(updateObj: Partial<T>) {
        this.logster.info('Updating browser storage', updateObj);

        await this.setItem(updateObj);
    }

    async getStorage(): Promise<T> {
        return new Promise((resolve) => {
            this.chromeStorage.get(null, (items) => {
                resolve(items as T);
            });
        });
    }

    onChange(): Observable<T> {
        return this.storageChanged$.asObservable();
    }

    private onStorageChange() {
        this.browser.storage.onChanged.addListener(
            async (changes: Record<string, chrome.storage.StorageChange>) => {
                const storage = await this.getStorage();

                const source: Partial<T> = {};
                for (const [key, change] of Object.entries(changes)) {
                    if (!deepEqual(change.newValue, storage[key as keyof T])) {
                        source[key as keyof T] = change.newValue;
                    }
                }

                this.storageChanged$.next({...storage, ...source});
            },
        );
    }

    private async loadInitialValue() {
        const storage = await this.getStorage();
        this.store = storage;
        this.storageChanged$.next(storage);
    }

    private async setItem(object: Partial<T>) {
        return new Promise((resolve) => {
            this.chromeStorage.set(object, () => resolve(void 0));
        });
    }
}
