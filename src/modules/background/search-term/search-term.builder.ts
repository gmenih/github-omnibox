import {injectable, injectAll, registry} from 'tsyringe';
import {Logster} from '../../../core/logster';
import {Storage} from '../../../core/storage';
import {BaseCommand} from './commands/base.command';
import {GlobalScopeCommand} from './commands/global-scope.command';
import {HelpCommand} from './commands/help.command';
import {PullRequestCommand} from './commands/pull-request.command';
import {UserScopeCommand} from './commands/user-scope.command';
import {PostHandlersFn, ResultType, SearchCommand, SearchTerm, SearchTermType} from './types/search-term';

const SEARCH_COMMAND = Symbol.for('tsy-search-command');

@registry([
    {token: SEARCH_COMMAND, useClass: GlobalScopeCommand},
    {token: SEARCH_COMMAND, useClass: UserScopeCommand},
    {token: SEARCH_COMMAND, useClass: PullRequestCommand},
    {token: SEARCH_COMMAND, useClass: HelpCommand},
    // This one must always be last!
    {token: SEARCH_COMMAND, useClass: BaseCommand},
])
@injectable()
export class SearchTermBuilder {
    private readonly log = new Logster('STB');

    constructor(@injectAll(SEARCH_COMMAND) private readonly commands: SearchCommand[]) {}

    buildSearchTerm(rawInput: string, storage: Storage): SearchTerm {
        let processingInput = rawInput;
        let resultType: ResultType = ResultType.Repository;
        let searchType = SearchTermType.Quick;

        const terms: string[] = [];
        const postHandlers: PostHandlersFn[] = [];
        const matchedCommands: SearchCommand[] = [];

        for (const command of this.commands) {
            const matches = command.pattern.exec(command.matchFull ? rawInput : processingInput);
            if (matches) {
                const response = command.handler?.(matches);
                if (response?.term) {
                    terms.push(response.term);
                }

                if (typeof command.postHandlers === 'function') {
                    postHandlers.push(command.postHandlers.bind(command));
                }

                resultType = command.resultType ?? resultType;
                searchType = command.searchType > searchType ? command.searchType : searchType;
                processingInput = processingInput.replace(matches[0], '').trim();
                matchedCommands.push(command);
            }
        }

        let finalTerms = [...terms];
        for (const postHandler of postHandlers) {
            finalTerms = postHandler(terms, matchedCommands, storage);
        }

        return {
            term: finalTerms.join(' '),
            resultType,
            type: searchType,
        };
    }
}
