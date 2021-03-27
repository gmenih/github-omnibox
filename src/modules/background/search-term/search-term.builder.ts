import {StorageService} from '@core/storage';
import {container} from 'tsyringe';
import {ResultType, SearchCommand, SearchTerm, SearchTermType} from './types/search-term';

export function searchTermFactory(...commands: SearchCommand[]) {
    return (): SearchTermBuilder =>
        new SearchTermBuilder(commands, container.resolve(StorageService));
}

const BASE_COMMAND: SearchCommand = {
    pattern: /.+/,
    type: SearchTermType.Quick,
    handler: (m) => ({term: m[0]}),
};

export class SearchTermBuilder {
    private readonly commands: SearchCommand[];

    constructor(commands: SearchCommand[], private readonly storageService: StorageService) {
        this.commands = commands.concat(BASE_COMMAND);
    }

    async buildSearchTerm(_input: string): Promise<SearchTerm> {
        let input = _input;
        let type = SearchTermType.Internal;
        let resultType: ResultType = ResultType.Repository;
        const storage = await this.storageService.getStorage();
        const terms: string[] = [];

        for (const command of this.commands) {
            const matches = command.pattern.exec(input);
            if (matches) {
                const response = command.handler(matches);
                if (response) {
                    response.term && terms.push(response.term);

                    resultType = command.resultType ?? resultType;
                    type = command.type > type ? command.type : type;
                    input = input.replace(matches[0], '').trim();
                }
            }
        }

        const finalTerm = this.replaceVariables(terms.join(' '), {
            USER: storage.username,
        });

        return {
            term: finalTerm,
            resultType,
            type,
        };
    }

    private replaceVariables(term: string, replacements: Record<string, string>): string {
        let val = term;
        for (const [variable, replacement] of Object.entries(replacements)) {
            val = val.replace(`!%%${variable.toUpperCase()}%%`, replacement);
        }

        return val;
    }
}
