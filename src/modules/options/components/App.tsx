import {EXTENSION_NAME} from '@core/core.const';
import React, {FunctionComponent} from 'react';
import {useStorage} from '../storage/store.context';
import {Alert} from './GitHubAuthentication/Alert';
import {GitHubAuthentication} from './GitHubAuthentication/GithubAuthentication';
import {Section} from './Section';
import {Settings} from './Settings';
import pkgJson from '../../../../package.json';

export const App: FunctionComponent = () => {
    const {isLoggedIn, errors, isLoading} = useStorage();
    const version = pkgJson.version ?? 'development';

    return (
        <div className="container">
            <div className="columns section">
                <div className="column is-1">
                    <img src="assets/icon-64.png" />
                </div>
                <div className="column">
                    <h1 className="title">
                        {EXTENSION_NAME}
                        <span className="tag is-info is-light ml-3">{version}</span>
                    </h1>
                    <div className="subtitle">GitHub repositories at your fingertips.</div>
                    {errors?.map((e) => (
                        <Alert key={e} type="danger">
                            {e}
                        </Alert>
                    ))}
                </div>
            </div>

            <div className="section">
                {!isLoggedIn && isLoading && <progress className="progress is-small is-primary" max="100" />}
                {isLoggedIn && <Settings />}
                <GitHubAuthentication />

                <Section title="Privacy" isExpandable={true} isExpanded={false}>
                    <p>
                        {EXTENSION_NAME} stores all of the data it uses in{' '}
                        <a
                            rel="noreferrer noopener"
                            href="https://developer.chrome.com/docs/extensions/reference/storage/#property-local">
                            <strong>unencrypted</strong> browser storage
                        </a>
                        . This includes the authentication token, a list of repositories you have access to, and any
                        other data required to operate this extension. None of this data ever leaves your browser
                        though, apart of the authentication token, which is required to authenticate all API requests to
                        GitHub.
                    </p>
                </Section>
            </div>
        </div>
    );
};
