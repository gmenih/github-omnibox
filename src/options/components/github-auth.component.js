/* eslint-disable */
import { h } from 'preact';
/* eslint-enable */
import { observer } from 'mobx-preact';
import PropTypes from 'prop-types';

import { authFlow, setOauthToken } from '../auth.state';

export const GithubAuth = observer(({ onAuthKeySet }) => {
    setOauthToken(onAuthKeySet);
    return (
        <article className="card github-auth">
            <header>
                <h3>Github login</h3>
            </header>
            <p>
                <span className="label">Note</span>&nbsp;
                Your organization owners might have restricted access to third party apps (this extension).
                { 'In that case, it\'s better to use the method below.' }
            </p>
            <footer className="flex one center">
                <div className="center-button">
                    <button className="success github-button" onClick={authFlow.start}>Authorize Github</button>
                </div>
            </footer>
        </article>
    );
});

GithubAuth.propTypes = {
    onAuthKeySet: PropTypes.func.isRequired,
};
