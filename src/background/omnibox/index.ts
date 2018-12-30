import {listenInputChanged, listenInputEntered, listenInputStarted} from '../../common/browser';
import {StorageObservable} from '../../common/storage';
import {onInputChanged, onInputEntered, onInputStarted} from './handlers';

export function omniboxBootstrap (storage: StorageObservable): void {
    listenInputStarted(onInputStarted(storage));
    listenInputChanged(onInputChanged(storage));
    listenInputEntered(onInputEntered(storage));
}
