import React, {FunctionComponent} from 'react';
import styled, {css, SimpleInterpolation} from 'styled-components';
import {SPACER_SMALL} from '../../style.constants';

export enum AlertType {
    warning = 'warning',
}

export interface AlertProps {
    type: AlertType;
}

const getAlertTypeStyle: (type: AlertType) => SimpleInterpolation = (type = AlertType.warning) => {
    return {
        [AlertType.warning]: css({
            background: 'rgba(244, 209, 66, .5)',
            border: '1px solid rgb(219, 178, 10)',
        }),
    }[type];
};

const StyledAlert = styled.div`
    border-radius: 2px;
    padding: ${SPACER_SMALL}px;
    margin: ${SPACER_SMALL}px 0;
`;

export const Alert: FunctionComponent<AlertProps> = ({type, children}) => {
    return <StyledAlert theme={[getAlertTypeStyle(type)]}>{children}</StyledAlert>;
};
Alert.defaultProps = {
    type: AlertType.warning,
};
