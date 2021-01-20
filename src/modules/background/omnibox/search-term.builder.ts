import {SearchCommand, SearchTerm, SearchTermArguments, SearchTermType} from './types/search-term';

export function searchTermFactory(...commands: SearchCommand[]) {
    return (): SearchTermBuilder => new SearchTermBuilder(commands);
}

const BASE_COMMAND: SearchCommand = {
    pattern: /.+/,
    type: SearchTermType.FromCache,
    handler: (m) => ({term: m[0]}),
};

export class SearchTermBuilder {
    constructor(private readonly commands: SearchCommand[]) {}

    async buildSearchTerm(_input: string): Promise<SearchTerm> {
        let input = _input;
        let type = SearchTermType.Internal;
        const terms: string[] = [];
        let termArguments: SearchTermArguments = {
            resultType: 'REPO',
        };

        for (const command of [...this.commands, BASE_COMMAND]) {
            const matches = command.pattern.exec(input);
            if (matches) {
                const response = await command.handler(matches);
                if (response) {
                    response.term && terms.push(response.term);
                    if (Object.keys(response.arguments ?? {}).length > 0) {
                        termArguments = {...termArguments, ...response.arguments};
                    }

                    type = command.type > type ? command.type : type;
                    input = input.replace(matches[0], '').trim();
                }
            }
        }

        return {
            term: terms.join(' '),
            arguments: termArguments,
            type,
        };
    }
}
