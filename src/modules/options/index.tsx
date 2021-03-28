import 'reflect-metadata';
import 'bulma/bulma.sass';
import './style.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './components/App';
import {createStorageService} from './state';
import {StorageProvider} from './storage/store.context';

const storageService = createStorageService();

ReactDOM.render(
    <StorageProvider storageService={storageService}>
        <App />
    </StorageProvider>,
    document.getElementById('root'),
);
