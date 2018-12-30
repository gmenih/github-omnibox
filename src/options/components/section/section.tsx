import styled from '@emotion/styled';
import React, {ReactNode} from 'react';
import {COLOR_GRAY, SPACER, SPACER_SMALL} from '../../style.contants';

const SectionContainer = styled.section`
    border-radius: 3px;
    border: 1px solid ${COLOR_GRAY[2]};
    margin: ${SPACER}px 0;
    background: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25), 0 5px 5px rgba(0, 0, 0, 0.22);
`;
const SectionTitle = styled.div`
    font-size: 1.2rem;
    font-weight: bold;
    padding: ${SPACER_SMALL}px ${SPACER}px;
    border-bottom: 1px solid ${COLOR_GRAY[1]};
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
}

export function Section ({title, children}: SectionProps) {
    return (
        <SectionContainer>
            <SectionTitle>{title}</SectionTitle>
            <SectionContent>{children}</SectionContent>
        </SectionContainer>
    );
}
