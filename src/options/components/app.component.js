/* eslint-disable no-unused-vars */
import { Component, h } from 'preact';
/* eslint-neable no-unused-vars */
import PropTypes from 'prop-types';
import { observer } from 'mobx-preact';

import { options } from '../../options.observable';
import { AuthComponent } from './authorization.component';
import { Settings } from './settings.component';
import { OPTION_STRINGS as OPT } from '../../constants';
import { Alerts } from './alerts.component';
import { GithubClient } from '../../github/client';
import { addAlert } from '../alerts.state';

const onAuthSet = async (authKey, type) => {
    const client = new GithubClient(authKey);
    try {
        const logins = await client.fetchUserLogins();
        if (!logins.length) {
            throw new Error('No logins available');
        }
        const [username] = logins;
        options.setValue(OPT.GITHUB_TOKEN, authKey);
        options.setValue(OPT.TOKEN_TYPE, type);
        addAlert(`Hello, ${username}! You have successfully authenticated.`, 'success', 10000);
    } catch (err) {
        console.error(err);
        addAlert('Oops! We couldn\'t authenticate your token. Please try again', 'warning', 15000);
    }
};


export const App = observer(() => (
    <div>
        <Alerts />
        <AuthComponent
            onAuthKeySet={onAuthSet}
            authTokenSet={options.authTokenSet}
        />
        <Settings />
    </div>
));

