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
    private token$ = new BehaviorSubject<string | undefined>(undefined);

    constructor(storage: StorageService) {
        storage.onKeysChanged('token').subscribe(({token}) => {
            if (token) {
                this.token$.next(token);
            }
        });

        this.token$.subscribe();
    }

    fetch<TResult>(input: RequestInfo, init?: RequestInit): Observable<TResult> {
        return new Observable((observer) => {
            fetch(input, init)
                .then((response) => response.json())
                .then((result) => {
                    observer.next(result);
                    observer.complete();
                })
                .catch((err) => observer.error(err));
        });
    }

    requestGQL<TResult, TVar = any>(gql: RequestDocument, variables: TVar): Observable<TResult> {
        return this.token$.pipe(
            skipWhile((token) => token === undefined),
            first(),
            switchMap((token) => from(this.gqlClient.request(gql, variables, {authorization: `Bearer ${token}`}))),
        );
    }
}
