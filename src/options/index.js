import { render, h } from 'preact';

import { AuthComponent } from './components/authorization.component';
import { Settings } from './components/settings.component'
import './styles/main.scss';


render(
    <AuthComponent />,
    document.getElementById('authorization')
);

render(
    <Settings />,
    document.getElementById('settings')
);
