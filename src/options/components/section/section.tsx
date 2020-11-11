import styled from '@emotion/styled';
import React, {ReactNode} from 'react';
import {COLOR_GRAY, SPACER, SPACER_SMALL} from '../../style.constants';

const SectionContainer = styled.section`
    border-radius: 3px;
    border: 1px solid ${COLOR_GRAY[2]};
    margin: ${SPACER}px 0;
    background: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25), 0 5px 5px rgba(0, 0, 0, 0.22);
`;
const SectionTitle = styled.div`
    display: flex;
    align-items: center;
    border-bottom: 1px solid ${COLOR_GRAY[1]};
    padding: ${SPACER_SMALL}px ${SPACER}px;

    &.big {
        padding: 20px ${SPACER}px;
    }

    h1 {
        font-size: 1.2rem;
        padding: 0;
        margin: 0;
        font-weight: bold;
    }

    .controls {
        margin-left: auto;
        font-size: 1rem;
        font-weight: normal;
    }
`;
const SectionContent = styled.main`
    padding: ${SPACER}px;
    font-size: 1rem;
    overflow: auto;
    code {
        background: #ededed;
        font-weight: bold;
        padding: ${SPACER_SMALL / 2}px;
    }
    a,
    a:visited,
    a:active,
    a:link {
        color: #0074d9;
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }
    &:not(:last-child) {
        margin-bottom: ${SPACER}px;
    }
`;

export const CenteredContent = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: ${SPACER}px 0;
`;

export interface SectionProps {
    title: string;
    children: ReactNode;
    controls?: ReactNode;
    type?: 'big';
}

export function Section({title, children, controls, type}: SectionProps) {
    return (
        <SectionContainer>
            <SectionTitle className={type}>
                <h1>{title}</h1>
                {controls && <div className="controls">{controls}</div>}
            </SectionTitle>
            <SectionContent>{children}</SectionContent>
        </SectionContainer>
    );
}
