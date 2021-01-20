export interface HandlerResult {
    term?: string;
    arguments?: SearchTermArguments;
}

export type HandlerFn = (
    matches: RegExpExecArray,
) => HandlerResult | Promise<HandlerResult> | Promise<undefined> | undefined;

export enum SearchTermType {
    Internal,
    FromCache,
    API,
}

export interface SearchTermArguments {
    resultType: 'REPO' | 'PR';
}

export interface SearchTerm {
    term: string;
    type: SearchTermType;
    arguments: SearchTermArguments;
}

export interface SearchCommand {
    handler: HandlerFn;
    pattern: RegExp;
    type: SearchTermType;
}
