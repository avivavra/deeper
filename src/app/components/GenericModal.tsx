import React, { useEffect } from 'react';

interface GenericModalProps {
    showModal: boolean;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    children: React.ReactNode;
}

export const GenericModal: React.FC<GenericModalProps> = ({ showModal, setShowModal, children }) => {
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[36rem] z-50">
                {children}
            </div>
        </div>
    );
};
