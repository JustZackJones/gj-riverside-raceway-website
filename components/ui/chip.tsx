import React from 'react';

interface ChipProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    width?: string;
}

/**
 * Displays main content with optional subtext below.
 */
export default function Chip({ children, className = '', style, width = '75px' }: ChipProps) {
    return (
        <span className={`${className} rounded text-sm mr-1 sm:mr-1 flex items-center justify-center`} style={{ minWidth: width, ...style }}>
            {children}
        </span>
    );
}
