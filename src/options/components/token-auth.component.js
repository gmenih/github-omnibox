/* eslint-disable */
import { h } from 'preact';
/* eslint-enable */
import { observer } from 'mobx-preact';
import PropTypes from 'prop-types';

import { authFlow } from '../auth.state';

export const SelfToken = observer(({ onAuthKeySet }) => {
    let token = '';
    const setValue = ({ target: { value } }) => {
        token = value;
    };
    const sendAuthToken = () => {
        onAuthKeySet(token, 'token');
    };

    return (
        <article className="card github-auth">
            <header>
                <h4>Self generated token</h4>
            </header>
            <p>
                Visit <a href="https://github.com/settings/tokens">Github settings</a> to generate your token.
                Make sure to give it full <code>repo</code> access.
                If you also wish to have repos from your organizations included, add <code>read:org</code> access.
            </p>
            <footer>
                <div className="flex one five-600 four-800">
                    <div className="four-fifth-600 three-fourth-800">
                        <input
                            disabled={authFlow.flowActive}
                            type="text"
                            placeholder="Github token..."
                            value={token}
                            onChange={setValue}
                        />
                    </div>
                    <div>
                        <button disabled={authFlow.flowActive} type="submit" onClick={sendAuthToken}>Save token</button>
                    </div>
                </div>
            </footer>
        </article>
    );
});

SelfToken.propTypes = {
    onAuthKeySet: PropTypes.func.isRequired,
};
