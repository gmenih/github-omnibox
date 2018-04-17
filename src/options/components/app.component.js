import { h, Component } from 'preact';

import { AuthComponent } from './authorization.component';
import { Settings } from './settings.component';
import { browser, storageWrapper } from '../../browser';
import { OPTION_STRINGS as OPT } from '../../constants';

const storage = storageWrapper(browser.storage.local);

export class App extends Component {
    constructor() {
        super();
        this.state = {
            authTokenSet: false,
            settings: {
                [OPT.SEARCH_NAME]: false,
                [OPT.SEARCH_LABEL]: false,
                [OPT.SEARCH_DESC]: false,
                [OPT.SEARCH_FORKED]: false,
            },
        };
        this.settings = {};
    }

    componentWillMount() {
        this.updateFromStore();
        browser.storage.onChanged.addListener(this.storeChangeListener.bind(this));
    }

    componentWillUnmount() {
        browser.storage.onChanged.removeListener(this.storeChangeListener.bind(this));
    }

    storeChangeListener(changes, instance) {
        if (instance !== 'local') { 
            return;
        }
        this.updateFromStore(changes);
    }
    updateFromStore() {
        storage.getItems(null).then((items) => {
            this.settings = items;
            const scopes = items[OPT.GITHUB_SEARCH_SCOPES] || [];
            const newState = {
                authTokenSet: !!items[OPT.GITHUB_TOKEN],
                settings: {
                    [OPT.SEARCH_NAME]: !!items[OPT.SEARCH_NAME],
                    [OPT.SEARCH_LABEL]: !!items[OPT.SEARCH_LABEL],
                    [OPT.SEARCH_DESC]: !!items[OPT.SEARCH_DESC],
                    [OPT.SEARCH_FORKED]: !!items[OPT.SEARCH_FORKED],
                },
            };
            this.setState(newState);
        });
    }

    onSettingChange(settingName, event) {
        console.log(settingName, event);
        if (event && event.target && event.target.type === 'checkbox') {
            const val = !!event.target.checked;
            storage.setItem(settingName, val);
            return;
        }
        storage.setItem(settingName, event.target.value);
    }

    onAuthSet(authKey, type) {
       storage.setItem(OPT.GITHUB_TOKEN, authKey);
       storage.setItem(OPT.TOKEN_TYPE, type);
    }

    render() {
        return (
            <div>
                <AuthComponent onAuthKeySet={ this.onAuthSet }authTokenSet={ this.state.authTokenSet } />
                <Settings onChange={ this.onSettingChange } values={ this.state.settings } />
            </div>
        );
    }
}
