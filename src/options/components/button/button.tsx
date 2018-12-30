import {css, SerializedStyles} from '@emotion/core';
import styled from '@emotion/styled';
import React, {ButtonHTMLAttributes, FunctionComponent} from 'react';
import {SPACER, SPACER_BIG, SPACER_SMALL} from '../../style.contants';

export enum ButtonType {
    primary,
    secondary,
    danger,
    muted,
}

export enum ButtonSize {
    normal,
    large,
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    inline?: boolean;
    size?: ButtonSize;
    styleType?: ButtonType;
}

const StyledButton = styled.button`
    display: block;
    border: none;
    outline: none;
    font-size: 1rem;
    font-weight: bold;
    padding: ${SPACER_SMALL}px ${SPACER}px;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
    ${(props) => props.theme}
`;

const getButtonTypeStyle: (type?: ButtonType) => SerializedStyles = (type = ButtonType.primary) => {
    return {
        [ButtonType.primary]: css({
            background: '#2ccc40',
        }),
        [ButtonType.secondary]: css({
            background: '#0074d9',
        }),
        [ButtonType.danger]: css({
            background: '#ff841a',
        }),
        [ButtonType.muted]: css({
            background: '#ccc',
        }),
    }[type];
};

const getButtonSizeStyle: (type?: ButtonSize) => SerializedStyles = (size = ButtonSize.normal) => {
    return {
        [ButtonSize.normal]: css({
            fontSize: '1rem',
        }),
        [ButtonSize.large]: css({
            fontSize: '1.5rem',
            padding: `${SPACER}px ${SPACER_BIG}px`,
        }),
    }[size];
};

export const Button: FunctionComponent<ButtonProps> = ({size, styleType, inline, children, ...props}) => {
    return (
        <StyledButton theme={[getButtonSizeStyle(size), getButtonTypeStyle(styleType)]} {...props}>
            {children}
        </StyledButton>
    );
};

Button.defaultProps = {
    inline: false,
    size: ButtonSize.normal,
    styleType: ButtonType.primary,
};
