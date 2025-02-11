import React, { useState, useRef } from 'react';

type CustomSliderProps = {
    value: number[];
    min: number;
    max: number;
    onChange: (value: number[]) => void;
};

const CustomSlider = ({ value, min, max, onChange }: CustomSliderProps) => {
    const [sliderValue, setSliderValue] = useState(value[0]);
    const sliderRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value);
        setSliderValue(newValue);
    };

    const handleMouseUp = () => {
        onChange([sliderValue]);
    };

    return (
        <input
            ref={sliderRef}
            type="range"
            min={min}
            max={max}
            value={sliderValue}
            onChange={handleChange}
            onMouseUp={handleMouseUp}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
    );
};

export default CustomSlider;
