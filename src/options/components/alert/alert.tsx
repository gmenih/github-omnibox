import {css, SerializedStyles} from '@emotion/core';
import styled from '@emotion/styled';
import React, {FunctionComponent} from 'react';
import {SPACER_SMALL} from '../../style.contants';

export enum AlertType {
    warning = 'warning',
}

export interface AlertProps {
    type: AlertType;
}

const getAlertTypeStyle: (type: AlertType) => SerializedStyles = (type = AlertType.warning) => {
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
