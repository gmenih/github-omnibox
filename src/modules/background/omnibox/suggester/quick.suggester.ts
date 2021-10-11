import {SuggestResult} from '@core/browser';
import {GithubRepository} from '@core/github';
import {Logster} from '@core/logster';
import Fuse from 'fuse.js';
import {Observable, of} from 'rxjs';
import {injectable, singleton} from 'tsyringe';
import {SearchTerm} from '../../search-term/types/search-term';
import {BaseSuggester} from '../types/commands';

const SUGGESTION_LIMIT = 15;

@injectable()
@singleton()
export class QuickSuggester implements BaseSuggester {
    private readonly log: Logster = new Logster('QuickSuggester');

    private readonly fuse: Fuse<GithubRepository> = new Fuse([], {
        keys: [
            {name: 'name', weight: 0.7},
            {name: 'owner', weight: 0.3},
        ],
        includeMatches: true,
        shouldSort: true,
    });

    setCollection(repositories: GithubRepository[]) {
        this.log.debug('Repositories changed', {length: repositories.length});
        this.fuse.setCollection(repositories);
    }

    suggest$(searchTerm: SearchTerm): Observable<SuggestResult[]> {
        this.log.debug('Quick searching');
        const fuseResults = this.fuse.search(searchTerm.term, {limit: SUGGESTION_LIMIT});
        const highlightMatch = new RegExp(`(${searchTerm.term})`, 'gi');

        return of(
            fuseResults.map((fuseResult) => {
                const repoName = `${fuseResult.item.owner}/${fuseResult.item.name}`.replace(
                    highlightMatch,
                    (match) => `<match>${match}</match>`,
                );
                return {
                    content: fuseResult.item.url,
                    description: `${repoName} <url>${fuseResult.item.url}</url>`,
                    deletable: true,
                };
            }),
        );
    }
}
