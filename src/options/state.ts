import {container} from 'tsyringe';
import {StorageService} from '../common/storage.service';

export function createStorageService(): StorageService {
    return container.resolve(StorageService);
}
