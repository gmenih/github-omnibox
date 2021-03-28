import React, {FunctionComponent} from 'react';

export enum AlertType {
    warning = 'warning',
    info = 'info',
    danger = 'danger',
}

export interface AlertProps {
    type: AlertType | keyof typeof AlertType;
}

export const Alert: FunctionComponent<AlertProps> = ({type, children}) => {
    return <div className={`notification is-${type}`}>{children}</div>;
};

Alert.defaultProps = {
    type: AlertType.warning,
};
