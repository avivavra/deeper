import React from 'react';
import { config } from '../../../../../config';

const shineStripeStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(120deg, #2563eb 0%, #2563eb 40%, #60a5fa 50%, #2563eb 60%, #2563eb 100%)',
    backgroundSize: '200% 100%',
    animation: 'shine-stripe-move 2s linear infinite'
};

// Add the keyframes globally if not already present
if (typeof window !== 'undefined' && !document.getElementById('shine-stripe-keyframes')) {
    const style = document.createElement('style');
    style.id = 'shine-stripe-keyframes';
    style.innerHTML = `
        @keyframes shine-stripe-move {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    `;
    document.head.appendChild(style);
}

export const SourceInAClickButton: React.FC = () => (
    <a
        href={config.sickUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={shineStripeStyle}
        className="ml-4 inline-flex items-center px-4 py-2 text-sm font-semibold text-white rounded shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14m-7 7h7a2 2 0 002-2v-7" />
        </svg>
        Source In A Click!
    </a>
);
