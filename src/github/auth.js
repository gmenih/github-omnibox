import fetch from 'fetch';

import { GITHUB_OAUTH_URL, GITHUB_TOKEN_URL } from '../constants';
import { browser } from '../browser';


const toQueryString = obj => Object.keys(obj).map(key => `${key}=${encodeURIComponent(obj[key])}`).join('&');
const toUrl = (url, obj) => `${url}?${toQueryString(obj)}`;

const getAuthUrl = (clientId, extensionId, scopes = ['repo', 'read:org']) => {
    const settingsUrl = `chrome-extension://${extensionId}/options_page.html`;
    return toUrl(GITHUB_OAUTH_URL, {
        client_id: clientId,
        redirect_uri: settingsUrl,
        scopes: scopes.join(' '),
    });
};

export const openAuthFlowPage = () => {
    const extensionId = browser.runtime.id;
    const clientId = process.env.CLIENT_ID;
    const scopes = ['repo', 'read:org'];
    const url = getAuthUrl(clientId, extensionId, scopes);
    browser.tabs.create({ url });
};

const generateTokenUrl = (clientId, clientSecret, code) =>
    toUrl(GITHUB_TOKEN_URL, {
        client_id: clientId,
        client_secret: clientSecret,
        code,
    });

export const fetchUserToken = (code) => {
    const {
        CLIENT_ID: clientId,
        CLIENT_SECRET: clientSecret,
    } = process.env;
    const tokenUrl = generateTokenUrl(clientId, clientSecret, code);
    return fetch(tokenUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
        },
    }).then(r => r.json());
};
