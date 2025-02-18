import { useCallback, useEffect, useState } from "react";

export const useEditMode = () => {
    const [isEditMode, setIsEditMode] = useState(false);

    const handleEditModeToggle = useCallback(() => {
        setIsEditMode(prev => !prev);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'e') {
                event.preventDefault();
                handleEditModeToggle();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleEditModeToggle]);

    return { isEditMode, handleEditModeToggle };
};