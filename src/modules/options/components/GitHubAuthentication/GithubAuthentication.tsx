import React, {FC} from 'react';
import {useFrontendService, useStorage} from '../../storage/store.context';
import {Section} from '../Section';
import {Alert} from './Alert';
import {TokenAuthorization} from './TokenAuthentication';

interface OAuthProps {
    onAuthTrigger: () => void;
}

const OAuth: FC<OAuthProps> = ({onAuthTrigger}) => (
    <div className="block">
        <h3 className="is-size-5">GitHub OAuth</h3>
        <div className="block">
            <p>Simply authenticate with your GitHub account and start using the extension.</p>
        </div>
        <Alert type="warning">
            Your organization owners might have restricted access to third party apps (e.g. this
            extension). Repositories from such organizations will now show up in search results if
            you use this authorization method.
        </Alert>
        <br />
        <button className="button is-primary is-large is-light" onClick={onAuthTrigger}>
            Sign in with GitHub
        </button>
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
