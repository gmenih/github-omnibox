import { observable, when } from 'mobx';
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
    when(
        () => authFlow.token.length === 40,
        () => {
            const { token } = authFlow;
            setKey(token, 'oauth');
            authFlow.clear();
        },
    );
};


when(
    () => authFlow.flowActive,
    () => {
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
