import { browser } from '../browser';

const codeRegex = /^\?code=([0-9a-z]+)&state=([0-9a-z]+)$/i;
const matches = window.location.search.match(codeRegex);

if (matches.length) {
    const [, code, state] = matches;
    browser.runtime.sendMessage({ code, state });
}
