import { render, h } from 'preact';

import { App } from './components/app.component';
import { OPTION_STRINGS as OPTIONS } from '../constants';
import { fetchUserToken } from '../github/auth';
import { browser, storageWrapper } from '../browser';
import './styles/main.scss';

const storage = storageWrapper(browser.storage.local);
const codeRegex = /^\?code=/i;

(async () => {
    if (codeRegex.test(window.location.search)) {
        const code = window.location.search.replace(codeRegex, '');
        const response = await fetchUserToken(code);
        if (response.access_token) {
            storage.setItem(OPTIONS.GITHUB_TOKEN, response.access_token);
        }
    }

    render(
        <App />,
        document.getElementById('app'),
    );
})();
