import {Observable} from 'rxjs';
import {inject, injectable} from 'tsyringe';
import {Browser, BROWSER_TOKEN} from './browser.provider';

export type Alarm = chrome.alarms.Alarm;

@injectable()
export class AlarmsService {
    constructor(@inject(BROWSER_TOKEN) private readonly browser: Browser) {}

    createPeriodicAlarm(alarmName: string, periodInMinutes: number) {
        this.browser.alarms.create(alarmName, {periodInMinutes});
    }

    onAlarmTriggered(alarmName: string): Observable<void> {
        return new Observable<void>((sub) => {
            const alarmHandler = (alarm: Alarm) => {
                if (alarm.name === alarmName) {
                    sub.next();
                }
            };

            this.browser.alarms.onAlarm.addListener(alarmHandler);
        });
    }

    clearAll() {
        this.browser.alarms.clearAll();
    }
}
