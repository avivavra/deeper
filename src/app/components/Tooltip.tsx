import React, { ReactNode, useState, useRef, useEffect } from 'react';

type TooltipProps = {
    content: ReactNode;
    children: ReactNode;
};

const Tooltip = ({ content, children }: TooltipProps) => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
    const [alignment, setAlignment] = useState<'left' | 'right'>('left');
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (visible && tooltipRef.current) {
            const { top, bottom, left, right } = tooltipRef.current.getBoundingClientRect();
            if (bottom > window.innerHeight) {
                setPosition('top');
            } else if (top < 0) {
                setPosition('bottom');
            }
            if (right > window.innerWidth) {
                setAlignment('right');
            } else if (left < 0) {
                setAlignment('left');
            }
        }
    }, [visible]);

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                className="cursor-pointer"
            >
                {children}
            </div>
            {visible && (
                <div
                    ref={tooltipRef}
                    className={`absolute z-10 w-48 p-2 text-sm text-white bg-black rounded-lg shadow-lg ${
                        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                    } ${alignment === 'right' ? 'right-0' : 'left-0'}`}
                >
                    {content}
                </div>
            )}
        </div>
    );
};

export default Tooltip;
