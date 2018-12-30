export interface SearchFlags {
    isGlobal: boolean;
    excludeForks: boolean;
}

function forkRegex (shortName: string, longName: string): RegExp {
    return new RegExp(`(^| )(\-(${shortName})|(\-{2}${longName}))( |$)`, 'i');
}

export function parseFlags (text: string): SearchFlags {
    return {
        excludeForks: forkRegex('nf', 'nofork').test(text),
        isGlobal: forkRegex('g', 'global').test(text),
    };
}

export function clearFlags (text: string): string {
    return text.replace(/(^| )\-{1,2}[a-z]+/gi, '').trim();
}
