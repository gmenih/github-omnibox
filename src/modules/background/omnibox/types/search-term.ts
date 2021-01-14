export type FormatterFn = (suggestion: string) => string;

export type HandlerFn = (matches: RegExpExecArray) => any;

export enum SearchTermType {
    Internal,
    FromCache,
    API,
}

export interface SearchTermArguments {
    resultType: 'REPO' | 'ISSUE';
}

export interface SearchTerm {
    formatter: FormatterFn;
    term: string;
    type: SearchTermType;
    arguments: SearchTermArguments;
}

export interface SearchCommand {
    formatter?: FormatterFn;
    handler: HandlerFn;
    pattern: RegExp;
    type: SearchTermType;
}
