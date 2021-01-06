export type FormatterFn = (suggestion: string) => string;

export interface SearchTermBuildResponse {
    formatter: FormatterFn;
    term: string;
    requiresApi: boolean;
}

export interface SearchTermActionResponse {
    term: string;
    replaceMatch?: boolean;
}

export interface SearchTermCommand {
    pattern: RegExp;
    formatter?: FormatterFn;
    action: (matches: RegExpExecArray) => SearchTermActionResponse | undefined;
}
