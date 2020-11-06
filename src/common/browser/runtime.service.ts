import {injectable, inject} from 'tsyringe';
import {BROWSER_TOKEN, Browser} from './browser.provider';

export type MessageSender = chrome.runtime.MessageSender;

@injectable()
export class RuntimeService {
    constructor(@inject(BROWSER_TOKEN) private readonly browser: Browser) {}

    public openOptionsPage (): Promise<void> {
        return new Promise((resolve) => this.browser.runtime.openOptionsPage(resolve));
    }

    public onRuntimeMessage<T> (): Promise<[T, MessageSender]> {
        return new Promise((resolve) => {
            const listener = (message: T, sender: MessageSender) => {
                resolve([message, sender]);
                this.browser.runtime.onMessage.removeListener(listener);
            };
            this.browser.runtime.onMessage.addListener(listener);
        });
    }

    public sendMessage (message: any): Promise<void> {
        return new Promise((resolve) => this.browser.runtime.sendMessage(message, resolve));
    }

}
