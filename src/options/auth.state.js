import { observable, reaction } from 'mobx';

import { onTabClosed } from '../browser';
import { openAuthFlowPage, fetchUserToken, onCodeReceived } from '../github/auth';
import { addAlert } from './alerts.state';

export const authFlow = observable({
    flowActive: false,
    token: '',
    start() {
        authFlow.flowActive = true;
    },
    stop() {
        authFlow.flowActive = false;
    },
    clear() {
        authFlow.token = '';
    },
});

export const setOauthToken = (setKey) => {
    reaction(
        () => authFlow.token,
        (token) => {
            if (token.length !== 40) {
                return;
            }
            setKey(token, 'oauth');
            authFlow.clear();
        },
    );
};


reaction(
    () => authFlow.flowActive,
    async (flowActive) => {
        if (!flowActive) {
            return;
        }
        const randomState = Math.random().toString(32).substr(2);
        const tab = await openAuthFlowPage(randomState);

        try {
            const code = await Promise.race([
                onCodeReceived(randomState),
                onTabClosed(tab, 'Couldn\'t complete - tab was closed'),
            ]);
            const accessToken = await fetchUserToken(code);
            authFlow.flowActive = false;
            authFlow.token = accessToken;
            addAlert('Successfuly authenticated!', 'success', 10000);
        } catch (err) {
            // tab closed
            authFlow.flowActive = false;
            authFlow.token = '';
            addAlert(err.message, 'warning', 15000);
        }
    },
);
