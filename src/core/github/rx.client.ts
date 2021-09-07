import {GraphQLClient} from 'graphql-request';
import {RequestDocument} from 'graphql-request/dist/types';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {skipWhile, switchMap, first} from 'rxjs/operators';
import {injectable} from 'tsyringe';
import {StorageService} from '../storage';
import {GITHUB_BASE_URL} from './github.const';

@injectable()
export class RxClient {
    private readonly gqlClient: GraphQLClient = new GraphQLClient(GITHUB_BASE_URL);
    private authToken$ = new BehaviorSubject<string | undefined>(undefined);

    constructor(storage: StorageService) {
        storage.onKeysChanged('token').subscribe(({token}) => {
            if (token) {
                this.authToken$.next(token);
            }
        });

        this.authToken$.subscribe();
    }

    fetch<TResult>(input: RequestInfo, init?: RequestInit): Observable<TResult> {
        return from(fetch(input, init)).pipe(switchMap((response) => from(response.json())));
    }

    requestGQL<TResult, TVar = any>(gql: RequestDocument, variables: TVar): Observable<TResult> {
        return this.authToken$.pipe(
            skipWhile((token) => token === undefined),
            first(),
            switchMap((token) => from(this.gqlClient.request(gql, variables, {authorization: `Bearer ${token}`}))),
        );
    }
}
