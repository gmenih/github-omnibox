import { GITHUB_OAUTH_URL, GITHUB_TOKEN_URL, REDIRECT_URL } from '../constants';
import { browser, fetch } from '../browser';


const toQueryString = obj => Object.keys(obj).map(key => `${key}=${encodeURIComponent(obj[key])}`).join('&');
const toUrl = (url, obj) => `${url}?${toQueryString(obj)}`;

const getAuthUrl = (clientId, extensionId, scopes = ['repo', 'read:org'], randomState = '') =>
    toUrl(GITHUB_OAUTH_URL, {
        client_id: clientId,
        redirect_uri: REDIRECT_URL,
        scopes: scopes.join(' '),
        state: randomState,
    });

export const openAuthFlowPage = async (randomState) => {
    const extensionId = browser.runtime.id;
    const clientId = process.env.CLIENT_ID;
    const scopes = ['repo', 'read:org'];
    const url = getAuthUrl(clientId, extensionId, scopes, randomState);
    return new Promise((resolve) => {
        browser.tabs.create({ url }, resolve);
    });
};

const generateTokenUrl = (clientId, clientSecret, code) =>
    toUrl(GITHUB_TOKEN_URL, {
        client_id: clientId,
        client_secret: clientSecret,
        code,
    });

export const fetchUserToken = (code) => {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const tokenUrl = generateTokenUrl(clientId, clientSecret, code);
    return fetch(tokenUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
        },
    })
        .then(r => r.json())
        .then(response => response.access_token);
};

export const onCodeReceived = async randomState =>
    new Promise((resolve) => {
        browser.runtime.onMessage.addListener(({ code, state }, sender) => {
            if (!code || state) return;
            if (randomState === state) {
                browser.tabs.remove([sender.tab.id]);
                resolve(code);
            }
        });
    });
