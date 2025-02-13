import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface GenericDropdownProps {
  buttonLabel: React.ReactNode;
  options: { label: string; value: string; checked?: boolean }[];
  onSelect: (value: string) => void;
  width?: string;
  type?: 'button' | 'radio' | 'checkbox';
  showChevron?: boolean;
  hideInputs?: boolean;
}

const GenericDropdown: React.FC<GenericDropdownProps> = ({ buttonLabel, options, onSelect, width = 'w-56', type = 'radio', showChevron = true, hideInputs = false }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {buttonLabel}
        {showChevron && <ChevronDown className="mx-2 h-4 w-4 text-gray-800" />}
      </button>
      {showDropdown && (
        <div className={`absolute right-0 mt-2 ${width} rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50`}>
          <div className="py-1">
            {options.map(option => (
              <div
                key={option.value}
                className="flex items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onSelect(option.value);
                  if (type === 'radio') setShowDropdown(false);
                }}
              >
                {!hideInputs && (
                  <input
                    type={type}
                    checked={option.checked}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                )}
                <span className="mx-2">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericDropdown;
