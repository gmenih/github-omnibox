import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {injectable, inject} from 'tsyringe';
import {fromBrowserEvent} from '../utils/rx.utils';
import {BROWSER_TOKEN, Browser} from './browser.provider';

export type MessageSender = chrome.runtime.MessageSender;

@injectable()
export class RuntimeService {
    constructor(@inject(BROWSER_TOKEN) private readonly browser: Browser) {}

    openOptionsPage(): Promise<void> {
        return new Promise((resolve) => this.browser.runtime.openOptionsPage(resolve));
    }

    onRuntimeMessage<T>(): Observable<[T, MessageSender]> {
        return fromBrowserEvent(this.browser.runtime.onMessage).pipe(
            map(([message, sender]) => [message as T, sender]),
        );
    }

    sendMessage<T>(message: T): Promise<void> {
        return new Promise((resolve) => this.browser.runtime.sendMessage(message, resolve));
    }
}
