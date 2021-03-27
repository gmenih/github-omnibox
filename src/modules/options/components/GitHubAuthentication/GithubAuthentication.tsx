import React, {FC} from 'react';
import {useFrontendService, useStorage} from '../../storage/store.context';
import {Section} from '../Section';
import {Alert} from './Alert';
import {Button, ButtonSize} from './Button';
import {TokenAuthorization} from './TokenAuthentication';

interface OAuthProps {
    onAuthTrigger: () => void;
}

const OAuth: FC<OAuthProps> = ({onAuthTrigger}) => (
    <div>
        <h3>GitHub OAuth</h3>
        <p>Simply authenticate with your GitHub account and start using the extension.</p>
        <Alert type="warning">
            Your organization owners might have restricted access to third party apps (e.g. this
            extension). Repositories from such organizations will now show up in search results if
            you use this authorization method.
        </Alert>
        <br />
        <Button size={ButtonSize.large} onClick={onAuthTrigger}>
            Sign in with GitHub
        </Button>
    </div>
);

export const GitHubAuthentication: FC = () => {
    const service = useFrontendService();
    const {isLoggedIn} = useStorage();

    return (
        <Section
            title={'\u{1F91F} GitHub Authentication'}
            isExpanded={!isLoggedIn}
            isExpandable={true}>
            <TokenAuthorization />
            <hr />
            <OAuth onAuthTrigger={() => service.createOAuthTab()} />
        </Section>
    );
};
