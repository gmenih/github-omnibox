import {EXTENSION_NAME} from '@core/core.consts';
import React, {FunctionComponent} from 'react';
import styled, {createGlobalStyle, DefaultTheme, GlobalStyleComponent} from 'styled-components';
import {useStorage} from '../storage/store.context';
import {COLOR_BLACK, COLOR_WHITE} from '../style.constants';
import {Alert} from './GitHubAuthentication/Alert';
import {GitHubAuthentication} from './GitHubAuthentication/GithubAuthentication';
import {Section} from './Section';
import {Settings} from './Settings';

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
    const {loggedIn, errors} = useStorage();
    const privacyMessage = `
        This extension stores all of your data in your browser's local storage, which
        can only be accessed by the extension itself. Nothing leaves your computer,
        other than requests to GitHub's API.
    `;

    return (
        <AppGrid>
            <GlobalStyles />
            <AppTitle>
                {'\u{1F50D}'} {EXTENSION_NAME}
            </AppTitle>

            {errors?.map((e) => (
                <Alert key={e} type="error">
                    {e}
                </Alert>
            ))}
            {loggedIn ? <Settings /> : null}
            <GitHubAuthentication />

            <Section title="Privacy" isExpandable={true} isExpanded={false}>
                <p>{privacyMessage}</p>
            </Section>
        </AppGrid>
    );
};
