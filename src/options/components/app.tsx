import {css, Global, SerializedStyles} from '@emotion/core';
import styled from '@emotion/styled';
import React, {FunctionComponent} from 'react';
import {useFrontendService, useStorage} from '../storage/store.context';
import {COLOR_BLACK, COLOR_WHITE} from '../style.constants';
import {GithubAuthorization} from './github-authorization/github-authorization';
import {Settings} from './settings/settings';
import {TokenAuthorization} from './token-authorization/token-authorization';

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

export const App: FunctionComponent = () => {
    const storage = useStorage();
    const frontendService = useFrontendService();
    const loggedIn = storage.loggedIn;

    const onAuthClick = () => {
        frontendService.createOAuthTab();
    };

    const onTokenSet = (token: string) => {
        frontendService.setTokenValue(token);
    };

    return (
        <AppGrid>
            <Global styles={globalStyles} />
            <AppTitle>{'\u{1F50D}'} GitHub Omnibox search</AppTitle>

            {loggedIn ? <Settings storage={storage} /> : null}
            <GithubAuthorization onAuthClick={onAuthClick} buttonMuted={loggedIn} />
            <TokenAuthorization onTokenSet={onTokenSet} buttonMuted={loggedIn} />
        </AppGrid>
    );
};
