import {action, IObservableObject, observable} from 'mobx';
import {getStorageItem, setStorage} from './browser';
import {browser} from './browser/browser';

const SEARCH_DEBOUNCE: number = 200;

interface Storage {
    displayName: string;
    loggedIn: boolean;
    optionsShown?: Date;
    organizations: string[];
    token?: string;
    username: string;
}

interface StorageMethods {
    setLoginData (success: boolean, username?: string, displayName?: string, organizations?: string[]): void;
    setToken (token: string): void;
    setOption<T extends keyof Storage> (key: T, value: Storage[T]): void;
}

const DEFAULT_VALUES: Storage = {
    displayName: '',
    loggedIn: false,
    organizations: observable.array(),
    token: '',
    username: '',
};

export type StorageObservable = Storage & StorageMethods & IObservableObject;

export function createStorageObservable (): StorageObservable {
    const storage = browser.storage;
    const storageObservable: StorageObservable = observable<Storage & StorageMethods>(
        {
            ...DEFAULT_VALUES,

            setLoginData (success: boolean, username?: string, displayName?: string, organizations?: string[]): void {
                const updateObject: Partial<Storage> = {
                    displayName: displayName || DEFAULT_VALUES.displayName,
                    loggedIn: success && !!username,
                    organizations: organizations || [],
                    username: username || DEFAULT_VALUES.username,
                };
                setStorage<Storage>(storage.local, updateObject);
            },
            setToken (token: string): void {
                setStorage<Storage>(storage.local, {token});
            },
            setOption (key: T, value: Storage[T]): void {
                setStorage<Storage>(storage.local, {
                    [key]: value,
                });
            },
        },
        {
            setLoginData: action,
            setOption: action,
            setToken: action,
        },
    );

    getStorageItem(storage.local, null).then(
        (options: object): void => {
            const initialState: Partial<Storage> = {...DEFAULT_VALUES, ...options};
            Object.assign(storageObservable, initialState);
        },
    );

    storage.onChanged.addListener(
        (changes): void => {
            const validChanges: Partial<Storage> = Object.entries(changes)
                .filter(([_, {newValue, oldValue}]): boolean => newValue !== oldValue)
                .reduce((result: any, [key, {newValue}]): any => ({...result, [key]: newValue}), {});
            Object.assign(storageObservable, validChanges);
        },
    );

    return storageObservable;
}
