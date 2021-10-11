import {RuntimeService} from '@core/browser';
import {AlarmsService} from '@core/browser/alarms.service';
import {GitHubClient} from '@core/github';
import {Logster} from '@core/logster';
import {StorageService} from '@core/storage';
import {combineLatest, forkJoin, Observable} from 'rxjs';
import {filter, first, mergeMap, switchMap} from 'rxjs/operators';
import {injectable} from 'tsyringe';
import {GitHubAuthClient} from '../../core/github/github-auth.client';
import {AuthMessage} from '../content-script/types/message';
import {OmniboxService} from './omnibox/omnibox.service';
import {QuickSuggester} from './omnibox/suggester/quick.suggester';

const PAGE_SIZE = 100;
const ALARM_NAME = 'daily-data-import';
const ALARM_PERIOD = 4 * 60; // 4 hours

@injectable()
export class BackgroundService {
    private readonly log: Logster = new Logster('BackgroundService');

    constructor(
        private readonly alarms: AlarmsService,
        private readonly githubAuth: GitHubAuthClient,
        private readonly githubClient: GitHubClient,
        private readonly omniboxService: OmniboxService,
        private readonly quickSuggester: QuickSuggester,
        private readonly runtime: RuntimeService,
        private readonly storage: StorageService,
    ) {}

    bootstrap() {
        this.log.debug('Bootstrap!');
        this.omniboxService.registerHandlers();

        this.storage
            .keysChanged$('repositories', 'selectHistory')
            .pipe(
                filter(({repositories, selectHistory}) => Array.isArray(repositories) && Array.isArray(selectHistory)),
                switchMap(() => this.storage.sortRepositories$()),
            )
            .subscribe(({repositories}) => {
                this.quickSuggester.setCollection(repositories ?? []);
            });

        this.storage
            .keysChanged$('token')
            .pipe(
                filter(({token}) => !!token),
                switchMap(() => this.fetchAndStoreUserData$()),
                switchMap(() => this.alarms.createPeriodicAlarm$(ALARM_NAME, ALARM_PERIOD)),
            )
            .subscribe();

        this.storage
            .keysChanged$('optionsShown')
            .pipe(
                filter(({optionsShown}) => !optionsShown),
                first(),
                mergeMap(() => {
                    this.log.debug('Opening options page');
                    this.runtime.openOptionsPage();
                    return this.storage.setOptionsShownDate$();
                }),
            )
            .subscribe();

        this.runtime
            .onRuntimeMessage<AuthMessage>()
            .pipe(
                mergeMap(([{code, state}]) => this.githubAuth.fetchAuthorizationToken(code, state)),
                mergeMap((token) => this.storage.saveToken$(token)),
            )
            .subscribe(() => {
                this.log.debug(`Should be authorized`);
            });

        this.alarms
            .alarmTriggered$(ALARM_NAME)
            .pipe(mergeMap(() => this.fetchAndStoreUserData$()))
            .subscribe();
    }

    private fetchAndStoreUserData$(): Observable<any> {
        return this.storage.setLoading$(true).pipe(
            mergeMap(() =>
                this.githubClient.fetchUserData$(PAGE_SIZE).pipe(
                    mergeMap((userData) =>
                        this.githubClient.fetchUserOrganizations$(PAGE_SIZE).pipe(
                            mergeMap((orgs) =>
                                combineLatest([
                                    forkJoin(orgs.map((o) => this.githubClient.fetchOrganizationRepositories$(o))),
                                    this.storage.saveLoginData$(
                                        userData.username,
                                        userData.displayName,
                                        orgs.map((o) => o.name),
                                    ),
                                ]),
                            ),
                            mergeMap(([orgRepos]) =>
                                this.storage.saveRepositories$(userData.repositories.concat(orgRepos.flat(1))),
                            ),
                            mergeMap(() => this.storage.setLoading$(false)),
                        ),
                    ),
                ),
            ),
        );
    }
}
