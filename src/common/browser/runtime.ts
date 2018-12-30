import {browser} from './browser';

export type MessageSender = chrome.runtime.MessageSender;

export function openOptionsPage (): Promise<void> {
    return new Promise((resolve) => browser.runtime.openOptionsPage(resolve));
}

export function onRuntimeMessage<T> (): Promise<[T, MessageSender]> {
    return new Promise((resolve) => {
        const listener = (message: T, sender: MessageSender) => {
            resolve([message, sender]);
            browser.runtime.onMessage.removeListener(listener);
        };
        browser.runtime.onMessage.addListener(listener);
    });
}

export function sendMessage (message: any): Promise<void> {
    return new Promise((resolve) => browser.runtime.sendMessage(message, resolve));
}
