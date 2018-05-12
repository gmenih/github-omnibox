import { h } from 'preact';
import PropTypes from 'prop-types';


export const SelfToken = ({ onAuthKeySet }) => {
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
                If you which to also read your organizations repositories, add <code>read:org</code> access.
            </p>
            <footer>
                <div className="flex one five-600 four-800">
                    <div className="four-fifth-600 three-fourth-800">
                        <input type="text" placeholder="Github token..." value={token} onCHange={setValue} />
                    </div>
                    <div>
                        <button type="submit" onClick={sendAuthToken}>Save token</button>
                    </div>
                </div>
            </footer>
        </article>
    );
};

