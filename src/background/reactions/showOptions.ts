import {reaction} from 'mobx';
import {openOptionsPage} from '../../common/browser';
import {StorageObservable} from '../../common/storage';

export function showOptionsOnce (storage: StorageObservable): void {
    const dispose = reaction(
        (): boolean => !!storage.optionsShown,
        async (shown) => {
            if (shown !== true) {
                await openOptionsPage();
                storage.setOption('optionsShown', true as any);
            }
            dispose();
        },
        {delay: 2000},
    );
    setTimeout(() => {
        dispose();
    }, 3000);
}
