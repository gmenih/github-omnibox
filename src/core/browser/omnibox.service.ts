import {inject, injectable} from 'tsyringe';
import {Browser, BROWSER_TOKEN} from './browser.provider';

export type EnteredDisposition = chrome.omnibox.OnInputEnteredDisposition;
export type SuggestFn = (suggestResults: chrome.omnibox.SuggestResult[]) => void;
export type InputEnteredCallback = (text: string, disposition: EnteredDisposition) => void;
export type InputChangedCallback = (text: string, suggest: SuggestFn) => void;
export type VoidCallback = () => void;
export type SuggestResult = chrome.omnibox.SuggestResult;

@injectable()
export class BrowserOmniboxService {
    constructor(@inject(BROWSER_TOKEN) private readonly browser: Browser) {}

    listenInputChanged(callback: InputChangedCallback) {
        this.browser.omnibox.onInputChanged.addListener(callback);
    }

    listenInputEntered(callback: InputEnteredCallback) {
        this.browser.omnibox.onInputEntered.addListener(callback);
    }

    listenInputCancelled(callback: VoidCallback) {
        this.browser.omnibox.onInputCancelled.addListener(callback);
    }

    listenDeleteSuggestion(callback: VoidCallback) {
        this.browser.omnibox.onDeleteSuggestion.addListener(callback);
    }

    listenInputStarted(callback: VoidCallback) {
        this.browser.omnibox.onInputStarted.addListener(callback);
    }

    setDefaultSuggestion(suggestion: chrome.omnibox.Suggestion) {
        this.browser.omnibox.setDefaultSuggestion(suggestion);
    }
}
