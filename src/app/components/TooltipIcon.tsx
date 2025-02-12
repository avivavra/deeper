import React from 'react';
import Tooltip from './Tooltip';

type TooltipIconProps = {
    content: string;
};

const TooltipIcon = ({ content }: TooltipIconProps) => (
    <Tooltip content={content}>
        <span className="ml-1 cursor-pointer text-gray-500">?</span>
    </Tooltip>
);

export default TooltipIcon;
