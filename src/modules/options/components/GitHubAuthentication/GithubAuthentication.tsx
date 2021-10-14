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
            Your organization owners will need to grant access to this extension, otherwise repositories owned by the
            organization will not show up in this extension. It is usually easier to use Personal Access Token
            authentication above, as it has no such limits.
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
        <Section title={'GitHub Authentication'} isExpanded={!isLoggedIn} isExpandable={true}>
            <TokenAuthorization />
            <hr />
            <OAuth onAuthTrigger={() => service.createOAuthTab()} />
        </Section>
    );
};
