import {browser} from './browser';

export type SuggestFunction = (suggestResults: chrome.omnibox.SuggestResult[]) => void;
export type InputEnteredCallback = (text: string, disposition: chrome.omnibox.OnInputEnteredDisposition) => void;
export type InputChangedCallback = (text: string, suggest: SuggestFunction) => void;
export type VoidCallback = () => void;
export type SuggestResult = chrome.omnibox.SuggestResult;

export function listenInputChanged (callback: InputChangedCallback): void {
    browser.omnibox.onInputChanged.addListener(callback);
}

export function listenInputEntered (callback: InputEnteredCallback): void {
    browser.omnibox.onInputEntered.addListener(callback);
}

export function listenInputCancelled (callback: VoidCallback): void {
    browser.omnibox.onInputCancelled.addListener(callback);
}

export function listenInputStarted (callback: VoidCallback): void {
    browser.omnibox.onInputStarted.addListener(callback);
}

export function setDefaulSuggestion (suggestion: chrome.omnibox.Suggestion): void {
    browser.omnibox.setDefaultSuggestion(suggestion);
}
