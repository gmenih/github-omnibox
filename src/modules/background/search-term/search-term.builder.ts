import {injectable, injectAll, registry} from 'tsyringe';
import {Logster} from '../../../core/logster';
import {BaseCommand} from './commands/base.command';
import {GlobalSearchCommand} from './commands/global.command';
import {PullRequestCommand} from './commands/pull-request.command';
import {UserScopeCommand} from './commands/user-scope.command';
import {PostHandlersFn, ResultType, SearchCommand, SearchTerm, SearchTermType} from './types/search-term';

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
    private readonly log = new Logster('STB');

    constructor(@injectAll(SEARCH_COMMAND) private readonly commands: SearchCommand[]) {}

    buildSearchTerm(rawInput: string): SearchTerm {
        let processingInput = rawInput;
        // lets search for repositories by default
        let resultType: ResultType = ResultType.Repository;
        let searchType = SearchTermType.Internal;

        const terms: string[] = [];
        const postHandlers: PostHandlersFn[] = [];

        for (const command of this.commands) {
            const matches = command.pattern.exec(command.matchFull ? rawInput : processingInput);
            if (matches) {
                const response = command.handler?.(matches);
                if (response) {
                    response.term && terms.push(response.term);
                }

                if (typeof command.postHandlers === 'function') {
                    postHandlers.push(command.postHandlers);
                }

                resultType = command.resultType ?? resultType;
                searchType = command.searchType > searchType ? command.searchType : searchType;
                processingInput = processingInput.replace(matches[0], '').trim();
            }
        }

        let finalTerms = [...terms];
        for (const postHandler of postHandlers) {
            finalTerms = postHandler(terms);
        }

        this.log.debug('Final term:', finalTerms, ResultType[resultType], SearchTermType[searchType]);

        return {
            term: finalTerms.join(' '),
            resultType,
            type: searchType,
        };
    }
}
