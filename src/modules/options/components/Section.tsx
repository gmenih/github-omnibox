import React, {ReactNode, useState} from 'react';

export interface SectionProps {
    title: string;
    children: ReactNode;
    controls?: ReactNode;
    type?: 'primary';
    isExpandable?: boolean;
    isExpanded?: boolean;
}

export function Section({title, children, controls, type, isExpanded, isExpandable}: SectionProps) {
    const [expanded, setExpanded] = useState(isExpandable !== false ? isExpanded ?? true : false);
    const onTitleClick = () => {
        if (isExpandable) {
            setExpanded(!expanded);
        }
    };

    return (
        <div className={`box${type ? ` is-${type}` : ''}`}>
            <div
                className="box-heading is-flex is-flex-direction-row is-clickable is-justify-content-space-between"
                onClick={onTitleClick}>
                <h2 className="is-size-4">{title}</h2>
                {controls && <div className="is-pulled-right">{controls}</div>}
            </div>
            {expanded === true && <div className="block">{children}</div>}
        </div>
    );
}
