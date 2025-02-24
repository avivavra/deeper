import React from 'react';

interface IndexNameAreaProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    error: boolean;
}

export const IndexNameArea: React.FC<IndexNameAreaProps> = ({ label, value, onChange, placeholder, error }) => (
    <div>
        <label className="text-sm font-medium text-gray-800">{label}</label>
        <input
            type="text"
            value={value || ''}
            onChange={onChange}
            className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${error ? 'border-red-500' : ''}`}
            placeholder={placeholder}
        />
    </div>
);
