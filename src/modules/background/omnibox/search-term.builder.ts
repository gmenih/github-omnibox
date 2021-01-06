import {injectable} from 'tsyringe';
import {FormatterFn, SearchTermBuildResponse, SearchTermCommand} from './types/search-term';

/**
 * Handles everything, should be the last command
 */
const BASE_COMMAND: SearchTermCommand = {
    pattern: /.*/,
    action: (matches) => ({
        term: matches[0] ?? '',
    }),
};

@injectable()
export class SearchTermBuilder {
    private commands: SearchTermCommand[] = [];

    withCommand(command: SearchTermCommand): SearchTermBuilder {
        this.commands.push(command);
        return this;
    }

    build(input: string): SearchTermBuildResponse {
        const terms: string[] = [];
        const formatters: FormatterFn[] = [];
        let _input = input;
        let requiresApi = false;

        for (const [i, command] of Object.entries([...this.commands, BASE_COMMAND])) {
            const matches = command.pattern.exec(_input);
            if (matches) {
                const response = command.action(matches);
                if (response) {
                    // if we get a response from non-BASE_COMMAND, we need to call the API
                    if (command !== BASE_COMMAND) {
                        requiresApi = true;
                    }
                    response.term && terms.push(response.term);
                    command.formatter && formatters.push(command.formatter);

                    _input = response.replaceMatch === true ? _input.replace(matches[0], '').trim() : _input;
                }
            }
        }

        const formatter: FormatterFn = (suggestion) => {
            let s = suggestion;
            formatters.forEach((fn) => {
                s = fn(s);
            });

            return s;
        };

        console.log('terms', terms);

        return {
            formatter,
            term: terms.join(' '),
            requiresApi,
        };
    }
}
