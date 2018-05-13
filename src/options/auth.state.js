import { observable, when } from 'mobx';
import { openAuthFlowPage, fetchUserToken } from '../github/auth';


export const authFlow = observable({
    flowActive: false,
    token: '',
    start() {
        authFlow.flowActive = true;
    },
});

when(
    () => authFlow.flowActive,
    () => {
        openAuthFlowPage();
    },
);
