/* eslint-disable no-unused-vars */
import { Component, h } from 'preact';
/* eslint-neable no-unused-vars */
import { observer } from 'mobx-preact';

import { OptionsObservable } from '../../options.observable';
import { AuthComponent } from './authorization.component';
import { Settings } from './settings.component';
import { OPTION_STRINGS as OPT } from '../../constants';
import { openAuthFlowPage } from '../../github/auth';

const onSettingChange = (settingName, event) => {
    let { value } = event.target;
    if (event && event.target && event.target.type === 'checkbox') {
        value = !!event.target.checked;
    }
    OptionsObservable.setValue(settingName, value);
};

const onAuthSet = (authKey, type) => {
    OptionsObservable.setValue(OPT.GITHUB_TOKEN, authKey);
    OptionsObservable.setValue(OPT.TOKEN_TYPE, type);
};


export const App = observer(({ options }) => {
    const { authTokenSet, ...settings } = options;
    return (
        <div>
            <AuthComponent
                onAuthKeySet={onAuthSet}
                authTokenSet={authTokenSet}
                beginAuthFlow={openAuthFlowPage}
            />
            <Settings onChange={onSettingChange} clearSettings={options.clearOptions} values={settings} />
        </div>
    );
});
