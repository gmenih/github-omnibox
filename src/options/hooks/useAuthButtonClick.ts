import {MouseEventHandler, useCallback} from 'react';
import {createTab, onRuntimeMessage, removeTab} from '../../common/browser';
import {fetchAuthorizationToken, generateOAuthPageURL} from '../../common/github/authorization';
import {AppState} from '../state';

interface TabMessage {
    state: string;
    code: string;
}

export function useAuthClick (): Promise<string> {
    const randomState = Math.random()
        .toString(36)
        .substr(2);

    createTab(generateOAuthPageURL(randomState));

    return onRuntimeMessage<TabMessage>().then(
        ([message, sender]): Promise<string> => {
            if (sender.tab && sender.tab.id) {
                removeTab(sender.tab.id);
            }
            if (message.state !== randomState) {
                throw new Error('States not matching!');
            }
            return fetchAuthorizationToken(message.code);
        },
    );
}
