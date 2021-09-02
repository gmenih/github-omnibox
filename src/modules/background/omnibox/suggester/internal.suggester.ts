import {injectable} from 'tsyringe';
import {SuggestResult} from '@core/browser';
import {SearchTerm} from '../../search-term/types/search-term';

function makeSuggestion(description: string, content = ''): SuggestResult {
    return {
        content,
        description,
    };
}

@injectable()
export class InternalSuggester {
    suggest(searchTerm: SearchTerm): SuggestResult[] {
        switch (searchTerm.term) {
            case 'help':
                return [
                    makeSuggestion('Add "#" to your search, to search for pull requests'),
                    makeSuggestion('Add "@<username>" to search within a user scope'),
                    makeSuggestion('Use "!" to search globally'),
                    makeSuggestion('Or just start typing to search for your repositories only'),
                ];
        }
        return [];
    }
}
