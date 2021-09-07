import deepEqual from 'deep-equal';
import {Observable, Subject} from 'rxjs';
import {inject, injectable} from 'tsyringe';
import {Logster} from '../logster/logster.service';
import {Browser, BROWSER_TOKEN} from './browser.provider';

@injectable()
export class BrowserStorageService<T> {
    private storageChanged$: Subject<T> = new Subject();
    private chromeStorage: chrome.storage.StorageArea;
    private readonly logster: Logster = new Logster('BrowserStorageService');

    constructor(@inject(BROWSER_TOKEN) private readonly browser: Browser) {
        this.chromeStorage = this.browser.storage['local'];
        this.onStorageChange();
        this.loadInitialValue();
    }

    async updateStorage(updateObj: Partial<T>) {
        this.logster.debug('Updating browser storage');

        await this.setItem(updateObj);
    }

    getStorage(): Observable<T> {
        return new Observable((observer) => {
            this.chromeStorage.get(null, (items) => {
                observer.next(items as T);
            });
        });
    }

    onChange(): Observable<T> {
        return this.storageChanged$.asObservable();
    }

    private onStorageChange() {
        this.browser.storage.onChanged.addListener((changes: Record<string, chrome.storage.StorageChange>) => {
            this.getStorage().subscribe((storage) => {
                const source: Partial<T> = {};
                for (const [key, change] of Object.entries(changes)) {
                    if (!deepEqual(change.newValue, storage[key as keyof T])) {
                        source[key as keyof T] = change.newValue;
                    }
                }

                this.storageChanged$.next({...storage, ...source});
            });
        });
    }

    private async loadInitialValue() {
        this.getStorage().subscribe((storage) => this.storageChanged$.next(storage));
    }

    private async setItem(object: Partial<T>) {
        return new Promise((resolve) => {
            this.chromeStorage.set(object, () => resolve(void 0));
        });
    }
}
