import React from 'react';

interface GenericModalProps {
    showModal: boolean;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    children: React.ReactNode;
}

const GenericModal: React.FC<GenericModalProps> = ({ showModal, setShowModal, children }) => {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-[36rem]">
                {children}
            </div>
        </div>
    );
};

export default GenericModal;
