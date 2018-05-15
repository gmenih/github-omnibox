import { observable, reaction } from 'mobx';
import { browser } from '../browser';
import { openAuthFlowPage, fetchUserToken } from '../github/auth';


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
    (flowActive) => {
        if (flowActive) {
            return;
        }
        const randomState = Math.random().toString(32).substr(2);
        browser.runtime.onMessage.addListener(async ({ code, state }, sender) => {
            if (randomState === state) {
                browser.tabs.remove([sender.tab.id]);
                try {
                    const accessToken = await fetchUserToken(code);
                    authFlow.flowActive = false;
                    authFlow.token = accessToken;
                } catch (err) {
                    console.error('Failed fetching Auth token');
                    console.error(err);
                }
            }
        });
        openAuthFlowPage(randomState);
    },
);
