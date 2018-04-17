import { h, Component } from 'preact';

import { browser, storageWrapper } from '../../browser';
import { OPTION_STRINGS as OPTIONS } from '../../constants';
import { GithubAuth } from './github-auth.component';
import { SelfToken } from './token-auth.component';

const storage = storageWrapper(browser.storage.local);

const showAuthWarning = (authTokenSet) => {
    if (authTokenSet === true) {
        return (
            <p>
                <span className="label success">Great!</span> 
                {' You\'re all set. If you wish, you can change your token below.'}
            </p>
        );
    }
    return (
        <p>
            <span className="label warning">Oops!</span>
            {' Looks like you haven\'t set your auth key yet. Please do so, to make the extension useful.'}
            <br />
            <br />
            You can set it up by logging in using Github, or generating your own token, and entering it below.
        </p>
    );
}

export const AuthComponent = ({ authTokenSet, onAuthKeySet }) => (
    <div className="authorization">
        <h2>Authorization token</h2>
        <div className="content">
            { showAuthWarning(authTokenSet) }
        </div>
        <div className="billboard">
            <GithubAuth onAuthKeySet={ onAuthKeySet } />
            <SelfToken onAuthKeySet={ onAuthKeySet } />
        </div>
    </div>
);
