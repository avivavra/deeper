import React, { useEffect } from 'react';

interface GenericModalProps {
    showModal: boolean;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    children: React.ReactNode;
    width?: string; // Optional width prop
}

export const GenericModal: React.FC<GenericModalProps> = ({ showModal, setShowModal, children, width = '36rem' }) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowModal(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [setShowModal]);

    if (!showModal) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
        >
            <div 
                className={`bg-white rounded-lg shadow-lg z-50`} 
                style={{ width }} // Use the width prop
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};
