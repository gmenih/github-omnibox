import {inject, injectable} from 'tsyringe';
import {Browser, BROWSER_TOKEN} from './browser.provider';

export type Tab = chrome.tabs.Tab;
export type TabOptions = chrome.tabs.CreateProperties;

@injectable()
export class TabsService {
    constructor(@inject(BROWSER_TOKEN) private readonly browser: Browser) {}

    public createTab(url: string, inputOptions: TabOptions = {}): Promise<Tab> {
        const options: TabOptions = {
            active: true,
            selected: true,
            url,
            ...inputOptions,
        };
        return new Promise((resolve: any) => {
            this.browser.tabs.create(options, resolve);
        });
    }

    public getSelectedTab(): Promise<Tab> {
        return new Promise<Tab>((resolve) => {
            this.browser.tabs.query({active: true}, (r) => resolve(r[0]));
        });
    }

    /** Removes current tab and creates a new one. chrome.tabs.update has issues with omnibox */
    public async redirectSelectedTab(url: string): Promise<void> {
        const tab = await this.getSelectedTab();
        if (!tab || tab.id === undefined) {
            throw new Error('Could not redirect tab');
        }

        await this.removeTab(tab.id);
        await this.createTab(url);
    }

    public removeTab(tabId: number): Promise<void> {
        return new Promise((resolve) => this.browser.tabs.remove([tabId], resolve));
    }

    public rejectOnTabClosed(tab: Tab): Promise<void> {
        return new Promise((_, reject) => {
            const listener = (closedTabId: number) => {
                if (closedTabId === tab.id) {
                    reject(tab);
                    this.browser.tabs.onRemoved.removeListener(listener);
                }
            };
            this.browser.tabs.onRemoved.addListener(listener);
        });
    }
}
