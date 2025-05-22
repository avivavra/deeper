import React, { useEffect, useRef } from 'react';

interface NameAreaProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    error: boolean;
}

export const NameArea: React.FC<NameAreaProps> = ({ label, value, onChange, placeholder, error }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div>
            <label className="text-sm font-medium text-gray-800">{label}</label>
            <input
                ref={inputRef}
                type="text"
                value={value || ''}
                onChange={onChange}
                className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${error ? 'border-red-500' : ''}`}
                placeholder={placeholder}
            />
        </div>
    );
};
