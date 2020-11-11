import React from 'react';
import {Alert, AlertType} from '../alert/alert';
import {Button, ButtonSize, ButtonType} from '../button/button';
import {CenteredContent, Section} from '../section/section';

export interface GithubAuthorizationProps {
    onAuthClick: () => void;
    buttonMuted: boolean;
}

export function GithubAuthorization({onAuthClick, buttonMuted}: GithubAuthorizationProps) {
    return (
        <Section title={'\u{1F91F} GitHub authorization'}>
            The easiest way to authorize. Just click the button below, and allow this extension to search in your name.
            <Alert type={AlertType.warning}>
                Note; your organization owners might have restricted access to third party apps (e.g. this extension). Repositories from
                such organizations will now show up in search results if you use this authorization method.
            </Alert>
            <CenteredContent>
                <Button size={ButtonSize.large} styleType={!buttonMuted ? ButtonType.primary : ButtonType.muted} onClick={onAuthClick}>
                    Authorize GitHub
                </Button>
            </CenteredContent>
        </Section>
    );
}
