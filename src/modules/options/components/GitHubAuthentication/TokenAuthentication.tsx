import {EXTENSION_NAME} from '@core/core.const';
import React, {ChangeEvent, FormEvent, FunctionComponent, useState} from 'react';
import {useFrontendService} from '../../storage/store.context';
import {Alert} from './Alert';

export const TokenAuthorization: FunctionComponent = () => {
    const [token, setToken] = useState('');
    const service = useFrontendService();
    const onInputChanged = (e: ChangeEvent<HTMLInputElement>) => setToken(e.target.value);
    const onFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        service.setTokenValue(token);
        setToken('');
    };

    const infoMessage = `
        This is the recommended method. It ensures that ${EXTENSION_NAME} can find all repositories you have
        access to. OAuth is easier, but you will need to ask for explicit permissions from each organization
        you belong to, to allow this extension from accessing it's repositories via OAuth.
    `;

    return (
        <div className="block">
            <h3 className="is-size-5">Personal Access Token</h3>
            <div className="block">
                <p>
                    Generate a{' '}
                    <a
                        href="https://github.com/settings/tokens"
                        rel="noopener noreferrer"
                        target="_blank">
                        Personal Access Token
                    </a>{' '}
                    with <code>repo:status</code> and <code>read:org</code> scopes.
                </p>
            </div>
            <Alert type="info">{infoMessage}</Alert>
            <form onSubmit={onFormSubmit}>
                <label htmlFor="fff" className="label">
                    Personal Access Token
                </label>
                <div className="field has-addons">
                    <div className="control is-expanded">
                        <input
                            className="input"
                            type="text"
                            placeholder="Paste the token here"
                            value={token}
                            onChange={onInputChanged}
                        />
                    </div>
                    <div className="control">
                        <button type="submit" className="button is-info">
                            Save token
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
