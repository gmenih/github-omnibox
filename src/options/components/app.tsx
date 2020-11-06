import {css, Global, SerializedStyles} from '@emotion/core';
import styled from '@emotion/styled';
import React, {FunctionComponent, useEffect, useRef, useState} from 'react';
import {Storage, StorageService} from '../../common/storage.service';
import {COLOR_BLACK, COLOR_WHITE} from '../style.contants';
import {GithubAuthorization} from './github-authorization/github-authorization';
import {Settings} from './settings/settings';
import {TokenAuthorization} from './token-authorization/token-authorization';

export interface AppProps {
    storageService: StorageService;
}

const globalStyles: SerializedStyles = css`
    html,
    body,
    #root {
        padding: 0;
        margin: 0;
        position: relative;
        color: ${COLOR_BLACK};
        background: ${COLOR_WHITE};
    }
    div {
        box-sizing: border-box;
    }
`;

const AppGrid = styled.div`
    width: 960px;
    margin: 0 auto;
`;

const AppTitle = styled.h1``;

export const App: FunctionComponent<AppProps> = ({storageService}) => {
    const [loading, setLoading] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const storage = useRef<Storage>();

    useEffect(() => {
        const s = storageService.onKeysChanged('token', 'loggedIn').subscribe(({token, loggedIn}) => {
            if (!token) {
                return;
            }

            console.log(token);
            setLoading(() => loggedIn);
        });

        storageService.onKeysChanged().subscribe((store: Storage) => {
            storage.current = store;
        })


        return () => {
            s.unsubscribe();
        }
    }, []);

    const onAuthClick = () => {};
    const onTokenSet = () => {};
 
    return (
        <AppGrid>
            <Global styles={globalStyles} />
            <pre>{JSON.stringify(storage)}</pre>
            <AppTitle>{'\u{1F50D}'} GitHub Omnibox search</AppTitle>
            {loggedIn ? <Settings state={storage.current} /> : null}
            <GithubAuthorization onAuthClick={onAuthClick} buttonMuted={loggedIn} />
            <TokenAuthorization onTokenSet={onTokenSet} buttonMuted={loggedIn} />
        </AppGrid>
    );
};
