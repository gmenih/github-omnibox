import {SuggestResult} from '@core/browser';
import {Observable, of} from 'rxjs';
import {injectable} from 'tsyringe';
import {SearchTerm} from '../../search-term/types/search-term';
import {BaseSuggester} from '../types/commands';

type InternalCommandPrefix = `__internal`;
enum Command {
    Help = 'help',
    Options = 'options',
    Refresh = 'refresh',
}

export type CommandString = `${InternalCommandPrefix}:${Command}`;

function makeSuggestion(description: string, command: Command): SuggestResult {
    return {
        content: `__internal:${command}`,
        description,
    };
}

export function isInternalCommand(url: string): url is CommandString {
    return url.startsWith('__internal');
}

@injectable()
export class InternalSuggester implements BaseSuggester {
    suggest$(searchTerm: SearchTerm): Observable<SuggestResult[]> {
        switch (searchTerm.term) {
            default:
                return of([
                    makeSuggestion('Quickly search your repositories <dim>Simply enter some text</dim>', Command.Help),
                    makeSuggestion('Open settings', Command.Options),
                    makeSuggestion('Refresh repositories', Command.Refresh),
                ]);
        }
    }

    // handleEnter$(result: SuggestResult): Observable<void> {
    //     const command: Command = (result.content as CommandString).replace('__internal:', '') as Command;

    //     switch (command) {
    //         case Command.Help:
    //             // TODO;
    //             break;
    //         case Command.Options:
    //             // TODO;
    //             break;
    //         case Command.Refresh:
    //             // TODO;
    //             break;
    //     }

    //     return of();
    // }
}
