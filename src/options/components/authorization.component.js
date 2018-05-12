/* eslint-disable no-unused-vars */
import { h } from 'preact';
/* eslint-enable no-unused-vars */
import PropTypes from 'prop-types';

import { AuthorizationStatus } from './authorization-status.component';
import { GithubAuth } from './github-auth.component';
import { SelfToken } from './token-auth.component';

export const AuthComponent = ({ authTokenSet, onAuthKeySet, beginAuthFlow }) => (
    <div className="authorization">
        <h2>Authorization token</h2>
        <AuthorizationStatus tokenSet={authTokenSet}>
            <GithubAuth beginAuthFlow={beginAuthFlow} />
            <SelfToken onAuthKeySet={onAuthKeySet} />
        </AuthorizationStatus>
    </div>
);

AuthComponent.propTypes = {
    authTokenSet: PropTypes.bool.isRequired,
    onAuthKeySet: PropTypes.func.isRequired,
    beginAuthFlow: PropTypes.func.isRequired,
};
