import {createStorageObservable} from '../common/storage';
import {omniboxBootstrap} from './omnibox';
import {fetchLoginsForToken} from './reactions/fetchLogins';
import {showOptionsOnce} from './reactions/showOptions';

function bootstrap (): void {
    const storage = createStorageObservable();
    showOptionsOnce(storage);
    fetchLoginsForToken(storage);
    omniboxBootstrap(storage);
}

bootstrap();
