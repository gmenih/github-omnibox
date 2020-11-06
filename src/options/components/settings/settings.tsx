import React, {FunctionComponent} from 'react';
import {Storage} from '../../../common/storage.service';
import {Section} from '../section/section';

export interface SettingsProps {
    state?: Storage;
}

export const Settings: FunctionComponent<SettingsProps> = ({state}) => {
    if (!state) {
        return <span>fuck</span>
    }
    
    const organizations = state.organizations.map((org: string) => <li key={org}>{org}</li>);
    return (
        <Section title={`\u{1F44B} Hello, ${state.displayName}!`}>
            <strong>Organizations I'll be searching in:</strong>
            <ul>
                <li>{state.username} (you)</li>
                {organizations}
            </ul>
        </Section>
    );
};
