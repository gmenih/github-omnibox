import {FormatterFn, SearchCommand, SearchTerm, SearchTermType} from './types/search-term';

export function searchTermFactory(...commands: SearchCommand[]) {
    return (): SearchTermBuilder => new SearchTermBuilder(commands);
}

const BASE_COMMAND: SearchCommand = {
    pattern: /.+/,
    type: SearchTermType.FromCache,
    handler: (m) => m[0],
};

export class SearchTermBuilder {
    constructor(private readonly commands: SearchCommand[]) {}

    buildSearchTerm(_input: string): SearchTerm {
        let input = _input;
        let type = SearchTermType.Internal;
        const terms: string[] = [];
        const formatters: FormatterFn[] = [];

        for (const command of [...this.commands, BASE_COMMAND]) {
            const matches = command.pattern.exec(input);
            if (matches) {
                const response = command.handler(matches);
                if (response) {
                    response.term && terms.push(response.term);
                    command.formatter && formatters.push(command.formatter);

                    type = command.type > type ? command.type : type;
                    input = input.replace(matches[0], '').trim();
                }
            }
        }

        return {
            formatter: this.buildFormatter(formatters),
            term: terms.join(' '),
            arguments: {resultType: 'REPO'},
            type,
        };
    }

    private buildFormatter(formatters: FormatterFn[]): FormatterFn {
        return (suggestion) => {
            let s = suggestion;
            formatters.forEach((fn) => {
                s = fn(s);
            });

            return s;
        };
    }
}
