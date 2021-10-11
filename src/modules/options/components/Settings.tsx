import {GithubRepository} from '@core/github';
import React, {FunctionComponent, MouseEventHandler, useState} from 'react';
import {useFrontendService, useStorage} from '../storage/store.context';
import {Section} from './Section';

function groupCountRepositories(repositories: GithubRepository[]): Array<[string, number]> {
    const m: Map<string, number> = new Map();

    for (const {owner} of repositories) {
        const currentValue = m.get(owner) ?? 0;
        m.set(owner, currentValue + 1);
    }

    return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export const Settings: FunctionComponent = () => {
    const {username, repositories, isLoading, displayName} = useStorage();
    const frontend = useFrontendService();
    const [showLogOutModal, setShowLogOutModal] = useState(false);

    const organizations = groupCountRepositories(repositories).map(([org, count]) => (
        <li key={org}>
            {org === username ? <strong>{org}</strong> : org} ({count} repositories)
        </li>
    ));

    const confirmLogOut: MouseEventHandler<Element> = (e) => {
        e.preventDefault();
        setShowLogOutModal(true);
    };

    const logOutConfirm: MouseEventHandler = (e) => {
        e.preventDefault();
        setShowLogOutModal(false);
        frontend.logOut();
    };

    const logOutCancel: MouseEventHandler = (e) => {
        e.preventDefault();
        setShowLogOutModal(false);
    };

    return (
        <Section title={`\u{1F44B} Hello, ${displayName}!`} type="info">
            {isLoading && (
                <div className="block">
                    <div className="content">
                        Hold on a moment while we fetch your GitHub repositories. It shouldn&apos;t take more than a
                        minute.
                    </div>
                    <progress className="progress is-small is-primary" max="100" />
                </div>
            )}
            {!isLoading && (
                <div className="orgs">
                    <div className="block">
                        <h4 className="is-size-5">Your organizations</h4>
                    </div>
                    <div className="block">
                        <ul>{organizations}</ul>
                    </div>
                    <div className="block">
                        There are <strong>{repositories.length}</strong> repositories to search for in total.
                    </div>
                    <div className="block">
                        <a className="is-link has-text-danger" onClick={confirmLogOut}>
                            Log out
                        </a>
                    </div>
                </div>
            )}

            {showLogOutModal && (
                <div className="modal is-active">
                    <div className="modal-background"></div>
                    <div className="modal-content">
                        <div className="box">
                            <div className="block is-size-3">Are you sure you want to log out?</div>
                            <div className="block">
                                This will clear all storage this extension keeps, so you will no longer be able to
                                search for repositories.
                            </div>
                            <div className="block">
                                <div className="field is-grouped">
                                    <div className="control">
                                        <button onClick={logOutConfirm} className="button is-danger">
                                            Confirm
                                        </button>
                                    </div>
                                    <div className="control">
                                        <button onClick={logOutCancel} className="button is-link is-light">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div onClick={logOutCancel} className="modal-close is-large" aria-label="close"></div>
                </div>
            )}
        </Section>
    );
};
