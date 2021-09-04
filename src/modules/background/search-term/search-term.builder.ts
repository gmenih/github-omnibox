import {injectable, injectAll, registry} from 'tsyringe';
import {Logster} from '../../../core/logster';
import {BaseCommand} from './commands/base.command';
import {GlobalSearchCommand} from './commands/global.command';
import {PullRequestCommand} from './commands/pull-request.command';
import {UserScopeCommand} from './commands/user-scope.command';
import {ResultType, SearchCommand, SearchTerm, SearchTermType} from './types/search-term';

const SEARCH_COMMAND = Symbol.for('tsy-search-command');

@registry([
    {token: SEARCH_COMMAND, useClass: GlobalSearchCommand},
    {token: SEARCH_COMMAND, useClass: UserScopeCommand},
    {token: SEARCH_COMMAND, useClass: PullRequestCommand},
    // This one must always be last!
    {token: SEARCH_COMMAND, useClass: BaseCommand},
])
@injectable()
export class SearchTermBuilder {
    constructor(@injectAll(SEARCH_COMMAND) private readonly commands: SearchCommand[]) {}

    async buildSearchTerm(rawInput: string): Promise<SearchTerm> {
        let processingInput = rawInput;
        // lets search for repositories by default
        let resultType: ResultType = ResultType.Repository;
        let searchType = SearchTermType.Internal;

        const terms: string[] = [];

        for (const command of this.commands) {
            const matches = command.pattern.exec(command.matchFull ? rawInput : processingInput);
            if (matches) {
                resultType = command.resultType ?? resultType;
                searchType = command.searchType > searchType ? command.searchType : searchType;

                const response = command.handler(matches);
                if (response) {
                    response.term && terms.push(response.term);
                }

                processingInput = processingInput.replace(matches[0], '').trim();
            }
        }

        return {
            term: terms.join(' '),
            resultType,
            type: searchType,
        };
    }
}
