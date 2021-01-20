import {Primitive} from '../types/primitive';

export function toQueryString(obj: Record<string, Primitive>): string {
    return Object.entries(obj)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
}
