export interface HandlerResult {
    term?: string;
    resultType?: ResultType;
}

export type HandlerFn = (matches: RegExpExecArray) => HandlerResult | undefined;

export enum SearchTermType {
    Internal,
    Quick,
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
     * Term also supports some variables, which are set in the builder.
     * Currently only 'USER' is supported.
     */
    handler: HandlerFn;
    /**
     * Pattern that will be matched against the input, to check if this command
     * should be handled. The matching array will be passed to the handler function.
     */
    pattern: RegExp;
    /**
     * Where the rults of this command will be
     */
    type: SearchTermType;
    /**
     * If 'Full', it will match the pattern again the full input. Otherwise, it
     * only matches it against the "current" input, after being parsed by
     * previous commands.
     */
    termMatch?: 'full';
}
