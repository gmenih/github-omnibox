import {inject, injectable} from 'tsyringe';
import {Browser, BROWSER_TOKEN} from './browser.provider';

export type EnteredDisposition = chrome.omnibox.OnInputEnteredDisposition;
export type SuggestFunction = (suggestResults: chrome.omnibox.SuggestResult[]) => void;
export type InputEnteredCallback = (text: string, disposition: EnteredDisposition) => void;
export type InputChangedCallback = (text: string, suggest: SuggestFunction) => void;
export type VoidCallback = () => void;
export type SuggestResult = chrome.omnibox.SuggestResult;

@injectable()
export class BrowserOmniboxService {
    constructor(@inject(BROWSER_TOKEN) private readonly browser: Browser) {}

    public listenInputChanged(callback: InputChangedCallback) {
        this.browser.omnibox.onInputChanged.addListener(callback);
    }

    public listenInputEntered(callback: InputEnteredCallback) {
        this.browser.omnibox.onInputEntered.addListener(callback);
    }

    public listenInputCancelled(callback: VoidCallback) {
        this.browser.omnibox.onInputCancelled.addListener(callback);
    }

    public listenDeleteSuggestion(callback: VoidCallback) {
        this.browser.omnibox.onDeleteSuggestion.addListener(callback);
    }

    public listenInputStarted(callback: VoidCallback) {
        this.browser.omnibox.onInputStarted.addListener(callback);
    }

    public setDefaultSuggestion(suggestion: chrome.omnibox.Suggestion) {
        this.browser.omnibox.setDefaultSuggestion(suggestion);
    }
}
