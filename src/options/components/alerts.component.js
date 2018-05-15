import { h } from 'preact';

import { observer } from 'mobx-preact';
import { alerts } from '../alerts.state';

const AlertsContainer = ({ children }) => (
    <div className="alerts-container">
        <div className="content">
            { children }
        </div>
    </div>
);

const Alert = ({ kind, children }) => (
    <div className={`alert ${kind}`}>
        { children }
    </div>
);

export const Alerts = observer(() => (
    <AlertsContainer>
        {
            alerts.map(({ kind, message }) => (
                <Alert kind={kind}>
                    {message}
                </Alert>
            ))
        }
    </AlertsContainer>
));
