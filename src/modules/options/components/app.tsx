import React, {FunctionComponent} from 'react';
import styled, {createGlobalStyle, DefaultTheme, GlobalStyleComponent} from 'styled-components';
import {useStorage} from '../storage/store.context';
import {COLOR_BLACK, COLOR_WHITE} from '../style.constants';
import {GithubAuthorization} from './github-authorization/github-authorization';
import {Settings} from './settings/settings';

const GlobalStyles: GlobalStyleComponent<any, DefaultTheme> = createGlobalStyle`
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
    const {loggedIn} = useStorage();

    return (
        <AppGrid>
            <GlobalStyles />
            <AppTitle>{'\u{1F50D}'} GitHub Omnibox search</AppTitle>

            {loggedIn ? <Settings /> : null}
            <GithubAuthorization />
        </AppGrid>
    );
};
