import {SuggestResult} from '../../../../core/browser';
import {Observable} from 'rxjs';
import {SearchTerm} from '../../search-term/types/search-term';

export type InternalFunctions = 'help' | 'about' | 'version';

export type InternalFunctionName = `internal:${InternalFunctions}`;

export interface BaseSuggester {
    /**
     * Receives a `searchTerm` and handles finding results for that search term.
     * Returns an observable.
     * Ref: https://developer.chrome.com/docs/extensions/reference/omnibox/#type-SuggestResult
     */
    suggest$(searchTerm: SearchTerm): Observable<SuggestResult[]>;

    /**
     * Handles what should happen when the user accepts a suggestion.
     * Is optional, if not implemented it will resort to default handling,
     * which will just open a new tab with the `content` of the suggest result.
     */
    handleEnter?(result: SuggestResult): void;
}
