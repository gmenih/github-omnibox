import 'reflect-metadata';

import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './components/app';
import {createStorageService} from './state';
import {StorageProvider} from './storage/store.context';

const storageService = createStorageService();

console.log(storageService);

ReactDOM.render(
    <StorageProvider storageService={storageService}>
        <App />
    </StorageProvider>,
    document.getElementById('root'),
);
