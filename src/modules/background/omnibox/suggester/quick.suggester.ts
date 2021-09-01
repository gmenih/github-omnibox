import Fuse from 'fuse.js';
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
        this.log.info('Repositories change. Length:', repositories.length);
        this.fuse.setCollection(repositories);
    }

    public async suggest(searchTerm: SearchTerm): Promise<SuggestResult[]> {
        this.log.info('Quick searching', searchTerm);
        const fuseResults = this.fuse.search(searchTerm.term, {limit: 5});
        this.log.info('Results', fuseResults);

        return fuseResults.map((fuseResult) => ({
            content: fuseResult.item.url,
            description: fuseResult.item.owner + '/' + fuseResult.item.name,
            deletable: true,
        }));
    }
}
