import {Storage} from '@core/storage';

export interface HandlerResult {
    term?: string;
    resultType?: ResultType;
}

export type HandlerFn = (matches: RegExpExecArray) => HandlerResult | undefined;
export type PostHandlersFn = (terms: string[], matchedCommands: SearchCommand[], storage: Storage) => string[];

export enum SearchTermType {
    // This is when we want to search for internal functions, like help (mostly unused)
    Internal,
    // For searching in our FuseJS "cache"
    Quick,
    // For actually making API calls to GitHub
    API,
}

export enum ResultType {
    Repository,
    PullRequest,
}

export interface SearchTerm {
    term: string;
    type: SearchTermType;
    resultType?: ResultType;
}

export interface SearchCommand {
    /**
     * The result type expected from this command ('REPO' if not set in any command)
     */
    resultType?: ResultType;
    /**
     * Handler function which should return an object of @type {HandlerResult}.
     * The `term` key should can be a string that should be added to the end of
     * the final term.
     */
    handler?: HandlerFn;

    /**
     * After all handlers have been execute, we can optionally run this function,
     * to fix terms if necessary. E.g.: for searching pull requests, we need this
     * to be able to add `involves` when there are no other search terms.
     */
    postHandlers?: PostHandlersFn;

    /**
     * Pattern that will be matched against the input, to check if this command
     * should be handled. The matching array will be passed to the handler function.
     */
    pattern: RegExp;
    /**
     * What the results of this command will be
     */
    searchType: SearchTermType;
    /**
     * If 'full', it will match the pattern against the full input. Otherwise, it
     * only matches it against whatever is left in the input - anything that has already
     * been parsed will be removed from matching
     */
    matchFull?: boolean;
}
