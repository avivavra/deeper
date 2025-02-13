import React, { useState, useRef, useEffect } from 'react';

type TooltipIconProps = {
    content: string;
    alignment?: 'left' | 'right';
};

const TooltipIcon = ({ content, alignment = 'left' }: TooltipIconProps) => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
    const [currentAlignment, setAlignment] = useState<'left' | 'right'>(alignment);
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
                <span className="inline-flex items-center mx-1 cursor-pointer text-blue-500 align-middle">
                    <svg width="20px" height="20px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                        <path fillRule="evenodd" d="M0 10C0 4.478 4.478 0 10 0c5.523 0 10 4.478 10 10 0 5.523-4.477 10-10 10-5.522 0-10-4.477-10-10zm11.125 2.002H8.989v-.141c.01-1.966.492-2.254 1.374-2.782.093-.056.19-.114.293-.178.73-.459 1.292-1.038 1.292-1.883 0-.948-.743-1.564-1.666-1.564-.851 0-1.657.398-1.712 1.533H6.304C6.364 4.693 8.18 3.5 10.294 3.5c2.306 0 3.894 1.447 3.894 3.488 0 1.382-.695 2.288-1.805 2.952l-.238.144c-.79.475-1.009.607-1.02 1.777V12zm.17 3.012a1.344 1.344 0 01-1.327 1.328 1.32 1.32 0 01-1.328-1.328 1.318 1.318 0 011.328-1.316c.712 0 1.322.592 1.328 1.316z"/>
                    </svg>
                </span>
            </div>
            {visible && (
                <div
                    ref={tooltipRef}
                    className={`absolute z-10 w-48 p-3 text-sm text-white bg-gray-900 rounded-lg shadow-md transition-opacity duration-300 text-${alignment} ${
                        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                    } ${currentAlignment === 'right' ? 'right-0' : 'left-0'}`}
                >
                    {content}
                </div>
            )}
        </div>
    );
};

export default TooltipIcon;
