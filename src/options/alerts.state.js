import { observable } from 'mobx';

export const alerts = observable.array([]);

export const addAlert = (message, kind, duration = 15000) => {
    alerts.push({ message, kind });
    setTimeout(() => {
        alerts.pop();
    }, duration);
};
