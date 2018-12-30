import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './components/app';
import {createAppState} from './state';

const state = createAppState();

ReactDOM.render(<App state={state} />, document.getElementById('root'));
