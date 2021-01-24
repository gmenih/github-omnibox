import {container} from 'tsyringe';
import {StorageService} from '@core/storage';

export function createStorageService(): StorageService {
    const storage = container.resolve(StorageService);

    return storage;
}
