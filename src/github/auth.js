import { GITHUB_OAUTH_URL, GITHUB_TOKEN_URL } from '../constants';
import { browser } from '../browser';

const { fetch } = window;

const getAuthUrl = (clientId, extensionId, scopes = ['repo', 'read:org']) => {
    const redir = encodeURIComponent(`chrome-extension://${extensionId}/options_page.html`);
    const scopesString = encodeURIComponent(scopes.join(' '));
    const fullUrl = `${GITHUB_OAUTH_URL}?client_id=${clientId}&redirect_uri=${redir}&scope=${scopesString}`;
    return fullUrl;
};

const getTokenUrl = (clientId, clientSecret, code) =>
    `${GITHUB_TOKEN_URL}?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`;

export const openAuthFlowPage = () => {
    const extensionId = browser.runtime.id;
    const clientId = process.env.CLIENT_ID;
    const scopes = ['repo', 'read:org'];
    const url = getAuthUrl(clientId, extensionId, scopes);
    browser.tabs.update({ url });
};

export const fetchUserToken = async (code) => {
    const clientSecret = process.env.CLIENT_SECRET;
    const clientId = process.env.CLIENT_ID;
    const response = await fetch(getTokenUrl(clientId, clientSecret, code), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
        },
    });
    return response.json();
};
