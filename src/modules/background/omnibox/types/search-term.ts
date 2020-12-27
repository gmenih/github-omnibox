export type FormatterFn = (suggestion: string) => string;

export interface SearchTermBuildResponse {
    formatter: FormatterFn;
    term: string;
    isCachable: boolean;
}

export interface SearchTermActionResponse {
    term: string;
    cleanedInput?: string;
}

export interface SearchTermCommand {
    pattern: RegExp;
    formatter?: FormatterFn;
    action: (matches: RegExpExecArray) => SearchTermActionResponse | undefined;
}
