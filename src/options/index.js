import { render, h, Component } from 'preact';

import { App } from './components/app.component';
import './styles/main.scss';

render(
    <App />,
    document.getElementById('app')
);
