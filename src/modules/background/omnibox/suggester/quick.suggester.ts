import Fuse from 'fuse.js';
import {Observable, of} from 'rxjs';
import {injectable, singleton} from 'tsyringe';
import {SuggestResult} from '@core/browser';
import {GithubRepository} from '@core/github';
import {Logster} from '@core/logster';
import {SearchTerm} from '../../search-term/types/search-term';

@injectable()
@singleton()
export class QuickSuggester {
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
        this.log.debug('Repositories change. Length:', repositories.length);
        this.fuse.setCollection(repositories);
    }

    suggest$(searchTerm: SearchTerm): Observable<SuggestResult[]> {
        this.log.debug('Quick searching');
        const fuseResults = this.fuse.search(searchTerm.term, {limit: 5});

        return of(
            fuseResults.map((fuseResult) => ({
                content: fuseResult.item.url,
                description: fuseResult.item.owner + '/' + fuseResult.item.name,
                deletable: true,
            })),
        );
    }
}
