import React, {FunctionComponent} from 'react';
import {GithubRepository} from '../../../common/github/types';
import {Storage} from '../../../common/storage.service';
import {Section} from '../section/section';

export interface SettingsProps {
    storage: Storage;
}

function groupCountRepositories(repositories: GithubRepository[]): Array<[string, number]> {
    const m: Map<string, number> = new Map();

    for (const {owner} of repositories) {
        const currentValue = m.get(owner) ?? 0;
        m.set(owner, currentValue + 1);
    }

    return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export const Settings: FunctionComponent<SettingsProps> = ({storage}) => {
    const organizations = groupCountRepositories(storage.repositories).map(([org, count]) => (
        <li key={org}>
            {org === storage.username ? <strong>{org}</strong> : org} ({count})
        </li>
    ));

    return (
        <Section title={`\u{1F44B} Hello, ${storage.displayName}!`} controls={<span>log out</span>} type={'big'}>
            <div className="orgs">
                <h4>Organizations</h4>
                {`We have found ${storage.repositories.length} repositories to search in, in these organizations`}
                <button>Refresh</button>
                <ul>{organizations}</ul>
            </div>
            <div className="ignore-regex">
                <h4>Ignore regex</h4>
                <p>Enter any pattern you wish to ignore </p>
                <input />
            </div>
        </Section>
    );
};
