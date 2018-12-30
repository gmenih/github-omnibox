import {css, Global, SerializedStyles} from '@emotion/core';
import styled from '@emotion/styled';
import {reaction} from 'mobx';
import {observer} from 'mobx-react';
import React from 'react';
import {useAuthClick} from '../hooks/useAuthButtonClick';
import {AppState} from '../state';
import {COLOR_BLACK, COLOR_WHITE} from '../style.contants';
import {Button, ButtonType} from './button/button';
import {GithubAuthorization} from './github-authorization/github-authorization';
import {Settings} from './settings/settings';
import {TokenAuthorization} from './token-authorization/token-authorization';

export interface AppProps {
    state: AppState;
}

const globalStyles: SerializedStyles = css`
    html,
    body,
    #root {
        padding: 0;
        margin: 0;
        position: relative;
        color: ${COLOR_BLACK};
        background: ${COLOR_WHITE};
    }
    div {
        box-sizing: border-box;
    }
`;

const AppGrid = styled.div`
    width: 960px;
    margin: 0 auto;
`;

const AppTitle = styled.h1``;

export const App = observer(({state}: AppProps) => {
    const onAuthClick = async () => {
        if (state.loading) {
            return;
        }
        state.loading = true;

        state.storage.setToken(await useAuthClick());
    };
    const onTokenSet = (token: string) => {
        if (state.loading || !token || token === state.storage.token) {
            return;
        }
        state.loading = true;
        const dispose = reaction(
            () => state.storage.organizations,
            () => {
                state.loading = false;
                dispose();
            },
        );
        state.storage.setToken(token);
    };
    return (
        <AppGrid>
            <Global styles={globalStyles} />
            <AppTitle>{'\u{1F50D}'} GitHub Omnibox search</AppTitle>
            {state.loggedIn ? <Settings state={state} /> : null}
            <GithubAuthorization onAuthClick={onAuthClick} buttonMuted={state.loggedIn} />
            <TokenAuthorization onTokenSet={onTokenSet} buttonMuted={state.loggedIn} />
        </AppGrid>
    );
});
