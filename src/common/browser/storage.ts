type StorageArea = chrome.storage.StorageArea;

export function getStorageItem (storage: StorageArea, key: null | string): Promise<object> {
    return new Promise((resolve) => storage.get(key, resolve));
}

export function setStorage<T> (storage: StorageArea, object: Partial<T>): Promise<void> {
    return new Promise((resolve) => storage.set(object, resolve));
}
