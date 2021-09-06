export function toQueryString(obj: Record<string, string>): string {
    return new URLSearchParams(obj).toString();
}
