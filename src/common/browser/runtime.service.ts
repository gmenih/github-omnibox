import {Observable} from 'rxjs';
import {injectable, inject} from 'tsyringe';
import {BROWSER_TOKEN, Browser} from './browser.provider';

export type MessageSender = chrome.runtime.MessageSender;

@injectable()
export class RuntimeService {
    constructor(@inject(BROWSER_TOKEN) private readonly browser: Browser) {}

    openOptionsPage(): Promise<void> {
        return new Promise((resolve) => this.browser.runtime.openOptionsPage(resolve));
    }

    onRuntimeMessage<T>(): Observable<[T, MessageSender]> {
        return new Observable<[T, MessageSender]>((sub) => {
            const listener = (message: T, sender: MessageSender) => {
                sub.next([message, sender]);
                sub.complete();
                this.browser.runtime.onMessage.removeListener(listener);
            };

            this.browser.runtime.onMessage.addListener(listener);
        });
    }

    sendMessage<T>(message: T): Promise<void> {
        return new Promise((resolve) => this.browser.runtime.sendMessage(message, resolve));
    }
}
