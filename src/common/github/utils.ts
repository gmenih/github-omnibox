export function toQueryString (obj: object): string {
    return Object.entries(obj)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
}
