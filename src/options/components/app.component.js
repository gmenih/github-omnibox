/* eslint-disable no-unused-vars */
import { Component, h } from 'preact';
/* eslint-neable no-unused-vars */
import PropTypes from 'prop-types';
import { observer } from 'mobx-preact';

import { options } from '../../options.observable';
import { AuthComponent } from './authorization.component';
import { Settings } from './settings.component';
import { OPTION_STRINGS as OPT } from '../../constants';

const onAuthSet = (authKey, type) => {
    options.setValue(OPT.GITHUB_TOKEN, authKey);
    options.setValue(OPT.TOKEN_TYPE, type);
};


export const App = observer(() => {
    const { authTokenSet } = options;
    return (
        <div>
            <AuthComponent
                onAuthKeySet={onAuthSet}
                authTokenSet={authTokenSet}
            />
            <Settings />
        </div>
    );
});

