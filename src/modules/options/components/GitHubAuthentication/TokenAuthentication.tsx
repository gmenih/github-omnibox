import React, {ChangeEvent, FormEvent, FunctionComponent, useState} from 'react';
import styled from 'styled-components';
import {EXTENSION_NAME} from '@core/core.consts';
import {useFrontendService} from '../../storage/store.context';
import {COLOR_GRAY, SPACER_SMALL} from '../../style.constants';
import {CenteredContent} from '../Section';
import {Alert} from './Alert';
import {Button, ButtonType} from './Button';

const TokenInput = styled.input`
    flex-grow: 1;
    flex-shrink: 0;
    padding: ${SPACER_SMALL}px;
    border: 1px solid ${COLOR_GRAY[2]};
    border-right: none;
    font-size: 1rem;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;

    & + button {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
`;

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
        <div>
            <h3>Personal Access Token</h3>
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
            <Alert type="info">{infoMessage}</Alert>
            <form onSubmit={onFormSubmit}>
                <CenteredContent>
                    <TokenInput
                        type="text"
                        placeholder="Paste the token here"
                        value={token}
                        onChange={onInputChanged}
                    />
                    <Button inline={true} styleType={ButtonType.secondary} type="submit">
                        Save token
                    </Button>
                </CenteredContent>
            </form>
        </div>
    );
};
