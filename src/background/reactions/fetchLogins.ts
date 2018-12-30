import {reaction} from 'mobx';
import {createClient, fetchLogins} from '../../common/github/queries';
import {StorageObservable} from '../../common/storage';

export function fetchLoginsForToken (storage: StorageObservable): void {
    reaction(
        (): string | undefined => storage.token,
        async (token) => {
            if (!token) {
                return;
            }
            try {
                const loginResult = await fetchLogins(createClient(token));
                if (loginResult.username) {
                    storage.setLoginData(
                        true,
                        loginResult.username,
                        loginResult.displayName,
                        loginResult.organizations,
                    );
                }
            } catch (err) {
                storage.setLoginData(false);
            }
        },
    );
}
