import React, {FunctionComponent} from 'react';
import styled, {css, SimpleInterpolation} from 'styled-components';
import {SPACER_SMALL} from '../../style.const';

export enum AlertType {
    warning = 'warning',
    info = 'info',
    error = 'error',
}

export interface AlertProps {
    type: AlertType | keyof typeof AlertType;
}

const getAlertTypeStyle: (type: AlertType) => SimpleInterpolation = (type = AlertType.warning) => {
    return {
        [AlertType.warning]: css({
            background: 'rgba(244, 209, 66, .5)',
            border: '1px solid rgb(219, 178, 10)',
        }),
        [AlertType.info]: css({
            background: 'rgba(66, 149, 244, 0.185)',
            border: '1px solid rgb(10, 66, 219)',
        }),
        [AlertType.error]: css({
            background: 'rgba(244, 66, 66, 0.185)',
            border: '1px solid rgb(219, 10, 10)',
        }),
    }[type];
};

const StyledAlert = styled.div`
    border-radius: 2px;
    padding: ${SPACER_SMALL}px;
    margin: ${SPACER_SMALL}px 0;

    ${(props) => props.theme};
`;

export const Alert: FunctionComponent<AlertProps> = ({type, children}) => {
    return <StyledAlert theme={[getAlertTypeStyle(type as AlertType)]}>{children}</StyledAlert>;
};

Alert.defaultProps = {
    type: AlertType.warning,
};
