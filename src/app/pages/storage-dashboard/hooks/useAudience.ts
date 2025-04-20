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
        const keysPressed = new Set<string>();
        const handleKeyDownEvent = (e: KeyboardEvent) => {
            e.preventDefault();

            keysPressed.add(e.key.toLowerCase());
            if (e.ctrlKey && keysPressed.has('s') && keysPressed.has('u') && keysPressed.has('l')) {
                e.preventDefault();
                setAudience(prev => (prev === 'developer' ? 'user' : 'developer'));
                keysPressed.clear(); // Clear the set to prevent repeated triggers
            }
        };

        const handleKeyUpEvent = (e: KeyboardEvent) => {
            keysPressed.delete(e.key.toLowerCase());
        };

        window.addEventListener('keydown', handleKeyDownEvent);
        window.addEventListener('keyup', handleKeyUpEvent);
        return () => {
            window.removeEventListener('keydown', handleKeyDownEvent);
            window.removeEventListener('keyup', handleKeyUpEvent);
        };
    }, []);

    return { audience, setAudience, direction, t };
};
