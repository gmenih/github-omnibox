import {browser} from './browser';

export type Tab = chrome.tabs.Tab;
export type TabOptions = chrome.tabs.CreateProperties;

export function createTab (url: string, inputOptions: TabOptions = {}): Promise<Tab> {
    const options: TabOptions = {
        active: true,
        selected: true,
        url,
        ...inputOptions,
    };
    return new Promise((resolve) => {
        browser.tabs.create(options, resolve);
    });
}

export function getSelectedTab (): Promise<Tab> {
    return new Promise((resolve) => {
        browser.tabs.getSelected(resolve);
    });
}

/** Removes current tab and creates a new one. chrome.tabs.update has issues with omnibox */
export function redirectTab (tab: Tab, url: string): Promise<Tab | undefined> {
    return new Promise((resolve, reject) => {
        if (!tab || tab.id === undefined) {
            return reject(new Error('Could not redirect'));
        }
        removeTab(tab.id)
            .then(() => createTab(url))
            .then(resolve);
    });
}

export function removeTab (tabId: number): Promise<void> {
    return new Promise((resolve) => browser.tabs.remove([tabId], resolve));
}

export function rejectOnTabClosed (tab: Tab): Promise<void> {
    return new Promise((_, reject) => {
        const listener = (closedTabId: number) => {
            if (closedTabId === tab.id) {
                reject(tab);
                browser.tabs.onRemoved.removeListener(listener);
            }
        };
        browser.tabs.onRemoved.addListener(listener);
    });
}
