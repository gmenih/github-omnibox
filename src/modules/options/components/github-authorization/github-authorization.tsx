import React, {FC} from 'react';
import {useFrontendService} from '../../storage/store.context';
import {Alert, AlertType} from '../alert/alert';
import {Button, ButtonSize} from '../button/button';
import {CenteredContent, Section} from '../section/section';
import {TokenAuthorization} from '../token-authorization/token-authorization';

export const GithubAuthorization: FC = () => {
    const service = useFrontendService();

    return (
        <Section title={'\u{1F91F} GitHub authorization'} isExpanded={false} isExpandable={true}>
            The easiest way to authorize. Just click the button below, and allow this extension to
            search in your name.
            <Alert type={AlertType.warning}>
                Note; your organization owners might have restricted access to third party apps
                (e.g. this extension). Repositories from such organizations will now show up in
                search results if you use this authorization method.
            </Alert>
            <CenteredContent>
                <Button size={ButtonSize.large} onClick={() => service.createOAuthTab()}>
                    Authorize GitHub
                </Button>
            </CenteredContent>
            <hr />
            <TokenAuthorization />
        </Section>
    );
};
