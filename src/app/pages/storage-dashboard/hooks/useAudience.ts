import { useEffect, useState } from "react";
import { Audience, Direction } from "../models";
import { translations } from "../translations";

export const useAudience = (defaultAudience: Audience) => {
    const [audience, setAudience] = useState<Audience>(defaultAudience);
    const direction: Direction = audience === 'user' ? 'rtl' : 'ltr';
    const t = translations[audience === 'user' ? 'hebrew' : 'english'];

    useEffect(() => {
        document.documentElement.dir = direction;
    }, [audience]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'd') {
                event.preventDefault();
                setAudience(prev => (prev === 'developer' ? 'user' : 'developer'));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return { audience, setAudience, direction, t };
};
