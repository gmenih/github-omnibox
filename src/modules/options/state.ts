import {container} from 'tsyringe';
import {StorageService} from '../../core/storage.service';

export function createStorageService(): StorageService {
    const storage = container.resolve(StorageService);

    return storage;
}
