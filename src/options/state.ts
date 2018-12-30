import {IObservableObject, observable, reaction} from 'mobx';
import {createStorageObservable, StorageObservable} from '../common/storage';

export interface AppState {
    storage: StorageObservable;
    displayName: string;
    loading: boolean;
    loggedIn: boolean;
    submittedAuth: boolean;
}

export type AppStateObservable = AppState & IObservableObject;

export function createAppState (): AppStateObservable {
    const storage = createStorageObservable();
    const state = observable<AppState>({
        loading: false,
        storage,
        submittedAuth: false,
        get displayName (): string {
            return storage.displayName || storage.username;
        },
        get loggedIn (): boolean {
            return storage.loggedIn;
        },
    });

    return state;
}
