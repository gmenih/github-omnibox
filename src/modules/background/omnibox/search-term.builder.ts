import {injectable} from 'tsyringe';
import {FormatterFn, SearchTermBuildResponse, SearchTermCommand} from './types/search-term';

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

        for (const command of this.commands) {
            const matches = command.pattern.exec(_input);
            if (matches) {
                const response = command.action(matches);
                if (response) {
                    terms.push(response?.term);
                    command.formatter && formatters.push(command.formatter);

                    _input = response.cleanedInput ?? _input;
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
            isCachable: terms.length === 1,
        };
    }
}
