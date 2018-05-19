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
        const codeReciever = onCodeReceived(randomState);
        const tab = await openAuthFlowPage(randomState);
        const tabClosedReciever = onTabClosed(tab, 'Couldn\'t complete authentication');

        try {
            const code = await Promise.race([
                codeReciever,
                tabClosedReciever,
            ]);
            const accessToken = await fetchUserToken(code);
            authFlow.flowActive = false;
            authFlow.token = accessToken;
            addAlert('Successfuly authenticated!', 'success', 10000);
        } catch (err) {
            authFlow.flowActive = false;
            authFlow.token = '';
            addAlert(err.message, 'warning', 15000);
        }
    },
);
