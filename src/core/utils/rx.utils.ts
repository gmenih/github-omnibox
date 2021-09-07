import {Observable} from 'rxjs';

export function fromBrowserEvent<TCallback extends (...args: any[]) => void>(
    event: chrome.events.Event<TCallback>,
): Observable<Parameters<TCallback>> {
    return new Observable<Parameters<TCallback>>((subscriber) => {
        const eventCallback = (...args: Parameters<TCallback>): void => {
            subscriber.next(args);
        };

        event.addListener(eventCallback as TCallback);
        subscriber.add(() => event.removeListener(eventCallback as TCallback));
    });
}
