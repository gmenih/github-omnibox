import {inject, injectable} from 'tsyringe';
import {fromBrowserEvent} from '../utils/rx.utils';
import {filter, tap, switchMap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Browser, BROWSER_TOKEN} from './browser.provider';

export type Tab = chrome.tabs.Tab;
export type TabOptions = chrome.tabs.CreateProperties;

@injectable()
export class TabsService {
    constructor(@inject(BROWSER_TOKEN) private readonly browser: Browser) {}

    createTab$(url: string, inputOptions: TabOptions = {}): Observable<Tab> {
        const options: TabOptions = {
            active: true,
            selected: true,
            url,
            ...inputOptions,
        };

        return new Observable((subscriber) => {
            this.browser.tabs.create(options, (tab) => {
                subscriber.next(tab);
                subscriber.complete();
            });
        });
    }

    getSelectedTab$(): Observable<Tab> {
        return new Observable((subscriber) => {
            this.browser.tabs.query({active: true}, (r) => {
                subscriber.next(r[0]);
                subscriber.complete();
            });
        });
    }

    /** Removes current tab and creates a new one. chrome.tabs.update has issues with omnibox */
    redirectSelectedTab$(url: string): Observable<void> {
        return this.getSelectedTab$().pipe(
            filter((tab) => tab?.id !== undefined),
            switchMap((tab) => this.createTab$(url).pipe(switchMap(() => this.removeTab$(tab.id as number)))),
        );
    }

    removeTab$(tabId: number): Observable<void> {
        return new Observable((subscriber) => {
            this.browser.tabs.remove([tabId], () => {
                subscriber.next();
                subscriber.complete();
            });
        });
    }

    tabClosed$(tab: Tab): Observable<[number, unknown]> {
        return fromBrowserEvent(this.browser.tabs.onRemoved).pipe(filter(([closedTabId]) => closedTabId === tab.id));
    }
}
