import styled from '@emotion/styled';
import React, {ChangeEvent, FormEvent, FunctionComponent, useState} from 'react';
import {COLOR_GRAY, SPACER_SMALL} from '../../style.contants';
import {Button, ButtonType} from '../button/button';
import {CenteredContent, Section} from '../section/section';

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

export interface TokenAuthorizationProps {
    onTokenSet: (value: string) => void;
    buttonMuted: boolean;
}

export const TokenAuthorization: FunctionComponent<TokenAuthorizationProps> = ({onTokenSet, buttonMuted}) => {
    const [token, setToken] = useState('');
    const onInputChanged = (e: ChangeEvent<HTMLInputElement>) => setToken(e.target.value);
    const onFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        onTokenSet(token);
    };

    return (
        <Section title={'\u{1F511} Personal access token'}>
            You can use your personal access token (generated in{' '}
            <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                GitHub Settings
            </a>
            ). To support searching, you need to give it the <code>repo</code> scope, and <code>read:org</code>, if you
            also want to search in your organizations' repos.
            <form onSubmit={onFormSubmit}>
                <CenteredContent>
                    <TokenInput
                        type="text"
                        placeholder="Paste the token here"
                        value={token}
                        onChange={onInputChanged}
                    />
                    <Button
                        inline={true}
                        styleType={!buttonMuted ? ButtonType.secondary : ButtonType.muted}
                        type="submit"
                    >
                        Save token
                    </Button>
                </CenteredContent>
            </form>
        </Section>
    );
};
