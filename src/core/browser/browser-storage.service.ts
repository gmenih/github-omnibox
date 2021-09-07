import deepEqual from 'deep-equal';
import {combineLatest, concat, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {inject, injectable} from 'tsyringe';
import {Logster} from '../logster/logster.service';
import {fromBrowserEvent} from '../utils/rx.utils';
import {Browser, BROWSER_TOKEN} from './browser.provider';

@injectable()
export class BrowserStorageService<T> {
    private chromeStorage: chrome.storage.StorageArea;
    private readonly logster: Logster = new Logster('BrowserStorageService');

    constructor(@inject(BROWSER_TOKEN) private readonly browser: Browser) {
        this.chromeStorage = this.browser.storage['local'];
    }

    async updateStorage(updateObj: Partial<T>) {
        this.logster.debug('Updating browser storage');

        await this.setItem(updateObj);
    }

    getStorage$(): Observable<T> {
        return new Observable((observer) => {
            this.chromeStorage.get(null, (items) => {
                observer.next(items as T);
                observer.complete();
            });
        });
    }

    storageChanged$(): Observable<T> {
        return concat(
            this.getStorage$(),
            fromBrowserEvent(this.browser.storage.onChanged).pipe(
                switchMap(([changes]) => combineLatest([of(changes), this.getStorage$()])),
                map(([changes, storage]) => {
                    const source: Partial<T> = {};
                    for (const [key, change] of Object.entries(changes)) {
                        if (!deepEqual(change.newValue, storage[key as keyof T])) {
                            source[key as keyof T] = change.newValue;
                        }
                    }

                    return {...storage, ...source};
                }),
            ),
        );
    }

    private async setItem(object: Partial<T>) {
        return new Promise((resolve) => {
            this.chromeStorage.set(object, () => resolve(void 0));
        });
    }
}
