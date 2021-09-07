import {inject, injectable} from 'tsyringe';
import {Observable} from 'rxjs';
import {Browser, BROWSER_TOKEN} from './browser.provider';
import {fromBrowserEvent} from '../utils/rx.utils';

export type EnteredDisposition = chrome.omnibox.OnInputEnteredDisposition;
export type SuggestFn = (suggestResults: chrome.omnibox.SuggestResult[]) => void;
export type InputEnteredCallback = (text: string, disposition: EnteredDisposition) => void;
export type InputChangedCallback = (text: string, suggest: SuggestFn) => void;
export type VoidCallback = () => void;
export type SuggestResult = chrome.omnibox.SuggestResult;

@injectable()
export class BrowserOmniboxService {
    constructor(@inject(BROWSER_TOKEN) private readonly browser: Browser) {}

    inputChanged$(): Observable<[string, SuggestFn]> {
        return fromBrowserEvent(chrome.omnibox.onInputChanged);
    }

    inputEntered$(): Observable<[string, EnteredDisposition]> {
        return fromBrowserEvent(this.browser.omnibox.onInputEntered);
    }

    inputCancelled$(): Observable<[]> {
        return fromBrowserEvent(this.browser.omnibox.onInputCancelled);
    }

    suggestionDeleted$(): Observable<[string]> {
        return fromBrowserEvent(this.browser.omnibox.onDeleteSuggestion);
    }

    inputStarted$(): Observable<[]> {
        return fromBrowserEvent(this.browser.omnibox.onInputStarted);
    }

    setDefaultSuggestion(suggestion: chrome.omnibox.Suggestion) {
        this.browser.omnibox.setDefaultSuggestion(suggestion);
    }
}
