import 'reflect-metadata';

import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './components/app';
import {createStorageService} from './state';

const storageService = createStorageService();

ReactDOM.render(<App storageService={storageService} />, document.getElementById('root'));
