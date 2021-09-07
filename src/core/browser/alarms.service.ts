import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {inject, injectable} from 'tsyringe';
import {fromBrowserEvent} from '../utils/rx.utils';
import {Browser, BROWSER_TOKEN} from './browser.provider';

export type Alarm = chrome.alarms.Alarm;

@injectable()
export class AlarmsService {
    constructor(@inject(BROWSER_TOKEN) private readonly browser: Browser) {}

    createPeriodicAlarm(alarmName: string, periodInMinutes: number) {
        this.browser.alarms.create(alarmName, {periodInMinutes});
    }

    alarmTriggered$(alarmName: string): Observable<Alarm> {
        return fromBrowserEvent(this.browser.alarms.onAlarm).pipe(
            filter(([alarm]) => alarm.name === alarmName),
            map(([alarm]) => alarm),
        );
    }

    clearAll() {
        this.browser.alarms.clearAll();
    }
}
