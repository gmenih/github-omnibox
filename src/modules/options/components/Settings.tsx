import {GithubRepository} from '@core/github';
import React, {FunctionComponent} from 'react';
import {useStorage} from '../storage/store.context';
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
    const storage = useStorage();

    const organizations = groupCountRepositories(storage.repositories).map(([org, count]) => (
        <li key={org}>
            {org === storage.username ? <strong>{org}</strong> : org} ({count} repositories)
        </li>
    ));

    return (
        <Section
            title={`\u{1F44B} Hello, ${storage.displayName}!`}
            controls={<span>log out</span>}
            type="primary">
            <div className="orgs">
                <div className="block">
                    We found <strong>{storage.repositories.length}</strong> repositories to search
                    for.
                </div>
                <div className="block">
                    <h4 className="is-size-5">Your organizations</h4>
                </div>
                <div className="block">
                    <ul>{organizations}</ul>
                </div>
            </div>
        </Section>
    );
};
