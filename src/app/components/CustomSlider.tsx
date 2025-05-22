import React, { useState, useRef, useEffect } from 'react';

type CustomSliderProps = {
    value: number[];
    min: number;
    max: number;
    onChange: (value: number[]) => void;
    resetKey: string;
    disabled?: boolean;
};

export const CustomSlider = ({ value, min, max, onChange, resetKey, disabled = false }: CustomSliderProps) => {
    const [sliderValue, setSliderValue] = useState(value[0]);
    const sliderRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setSliderValue(value[0]); // Reset slider value when resetKey changes
    }, [resetKey, value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value);
        setSliderValue(newValue);
        onChange([newValue]);
    };

    const handleMouseDown = () => {
        if (!disabled) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (sliderRef.current && !disabled) {
            const newValue = parseInt(sliderRef.current.value);
            setSliderValue(newValue);
            onChange([newValue]);
        }
    };

    const handleMouseUp = () => {
        if (!disabled) {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
    };

    return (
        <input
            ref={sliderRef}
            type="range"
            min={min}
            max={max}
            value={sliderValue}
            onChange={handleChange}
            onMouseDown={handleMouseDown}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            disabled={disabled}
        />
    );
};
