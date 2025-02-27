import { useCallback, useEffect, useState } from "react";

export const useSimulation = () => {
    const [isInSimulation, setisInSimulation] = useState(false);

    const handleSimulationToggle = useCallback(() => {
        setisInSimulation(prev => !prev);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'e') {
                event.preventDefault();
                handleSimulationToggle();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSimulationToggle]);

    return { isInSimulation, handleSimulationToggle };
};