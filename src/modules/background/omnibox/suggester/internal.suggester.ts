import {SuggestResult} from '@core/browser';
import {Observable, of} from 'rxjs';
import {injectable} from 'tsyringe';
import {SearchTerm} from '../../search-term/types/search-term';
import {BaseSuggester} from '../types/commands';

function makeSuggestion(description: string, content = '#'): SuggestResult {
    return {
        content,
        description,
    };
}

@injectable()
export class InternalSuggester implements BaseSuggester {
    suggest$(searchTerm: SearchTerm): Observable<SuggestResult[]> {
        switch (searchTerm.term) {
            default:
            case 'help':
                return of([
                    makeSuggestion('Quickly search your repositories <dim>Simply enter some text</dim>', '1'),
                    makeSuggestion('Find results by a specific user <dim>@&lt;username&gt;</dim>', '2'),
                ]);
        }
    }
}
