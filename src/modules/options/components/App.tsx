import {EXTENSION_NAME} from '@core/core.const';
import React, {FunctionComponent} from 'react';
import {useStorage} from '../storage/store.context';
import {Alert} from './GitHubAuthentication/Alert';
import {GitHubAuthentication} from './GitHubAuthentication/GithubAuthentication';
import {Section} from './Section';
import {Settings} from './Settings';

export const App: FunctionComponent = () => {
    const {isLoggedIn, errors} = useStorage();
    const privacyMessage = `
        This extension stores all of your data in your browser's local storage, which
        can only be accessed by the extension itself. Nothing leaves your computer,
        other than requests to GitHub's API.
    `;

    return (
        <div className="container">
            <div className="section">
                <h1 className="title">{EXTENSION_NAME}</h1>
                <div className="subtitle">Your GitHub repositories at your fingertips.</div>
                {errors?.map((e) => (
                    <Alert key={e} type="danger">
                        {e}
                    </Alert>
                ))}
            </div>

            <div className="section">
                {isLoggedIn ? <Settings /> : null}
                <GitHubAuthentication />

                <Section title="Privacy" isExpandable={true} isExpanded={false}>
                    <p>{privacyMessage}</p>
                </Section>
            </div>
        </div>
    );
};
