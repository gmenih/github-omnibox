import {observer} from 'mobx-react';
import React from 'react';
import {AppState} from '../../state';
import {Section} from '../section/section';

export interface SettingsProps {
    state: AppState;
}

export const Settings = observer(({state}: SettingsProps) => {
    const organizations = state.storage.organizations.map((org) => <li key={org}>{org}</li>);
    return (
        <Section title={`\u{1F44B} Hello, ${state.displayName}!`}>
            <strong>Organizations I'll be searching in:</strong>
            <ul>
                <li>{state.storage.username} (you)</li>
                {organizations}
            </ul>
        </Section>
    );
});
