import {RuntimeService} from '@core/browser';
import {AlarmsService} from '@core/browser/alarms.service';
import {GitHubClient} from '@core/github';
import {Logster} from '@core/logster';
import {StorageService} from '@core/storage';
import {forkJoin, Observable} from 'rxjs';
import {filter, map, mergeMap, switchMap, tap} from 'rxjs/operators';
import {injectable} from 'tsyringe';
import {GitHubAuthClient} from '../../core/github/github-auth.client';
import {AuthMessage} from '../content-script/types/message';
import {OmniboxService} from './omnibox/omnibox.service';

const PAGE_SIZE = 100;
const ALARM_NAME = 'daily-data-import';
const ALARM_PERIOD = 4 * 60; // 4 hours

@injectable()
export class BackgroundService {
    private readonly log: Logster = new Logster('BackgroundService');

    constructor(
        private readonly alarms: AlarmsService,
        private readonly githubClient: GitHubClient,
        private readonly githubAuth: GitHubAuthClient,
        private readonly omniboxService: OmniboxService,
        private readonly runtime: RuntimeService,
        private readonly storage: StorageService,
    ) {}

    bootstrap() {
        this.log.debug('Bootstrap!');
        this.omniboxService.registerHandlers();

        this.storage
            .keysChanged$('token')
            .pipe(
                filter(({token}) => !!token),
                switchMap(() => this.fetchAndStoreUserData$()),
                tap(() => this.alarms.createPeriodicAlarm(ALARM_NAME, ALARM_PERIOD)),
            )
            .subscribe();

        this.storage.keysChanged$('optionsShown').subscribe(async ({optionsShown}) => {
            if (!optionsShown) {
                this.log.debug('Opening options page');
                await this.runtime.openOptionsPage();
                this.storage.setOptionsShownDate();
            }
        });

        this.runtime
            .onRuntimeMessage<AuthMessage>()
            .pipe(switchMap(([{code, state}]) => this.githubAuth.fetchAuthorizationToken(code, state)))
            .subscribe((authToken) => {
                this.storage.saveToken(authToken);
                this.log.debug(`Should be authorized`);
            });

        this.alarms
            .alarmTriggered$(ALARM_NAME)
            .pipe(switchMap(() => this.fetchAndStoreUserData$()))
            .subscribe();
    }

    private fetchAndStoreUserData$(): Observable<void> {
        return this.githubClient.fetchUserData$(PAGE_SIZE).pipe(
            switchMap((userData) =>
                this.githubClient.fetchUserOrganizations$(PAGE_SIZE).pipe(
                    tap((orgs) => {
                        this.storage.saveLoginData(
                            userData.username,
                            userData.displayName,
                            orgs.map((o) => o.name),
                        );
                        this.storage.addRepositories(userData.repositories);
                    }),
                    mergeMap((orgs) => forkJoin(orgs.map((o) => this.githubClient.fetchOrganizationRepositories$(o)))),
                    map((orgRepos) => {
                        this.storage.addRepositories(orgRepos.flat(1));
                    }),
                ),
            ),
        );
    }
}
