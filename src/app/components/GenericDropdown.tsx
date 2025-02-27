import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

export const GenericDropdown: React.FC<GenericDropdownProps> = ({ buttonLabel, options, onSelect, width = 'w-56', type = 'radio', showChevron = true, hideInputs = false }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showDropdown && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const dropdownWidth = dropdownMenuRef.current?.offsetWidth || 0;
      const dropdownHeight = dropdownMenuRef.current?.offsetHeight || 0;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = rect.bottom;
      let left = rect.left;

      if (rect.left + dropdownWidth > viewportWidth) {
        left = viewportWidth - dropdownWidth - 10; // 10px padding from the edge
      }

      if (rect.bottom + dropdownHeight > viewportHeight) {
        top = rect.top - dropdownHeight;
      }

      setDropdownPosition({ top, left });
    }
  }, [showDropdown]);

  const dropdownMenu = (
    <div
      ref={dropdownMenuRef}
      className={`absolute ${width} rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50`}
      style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
    >
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
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {buttonLabel}
        {showChevron && <ChevronDown className="mx-2 h-4 w-4 text-gray-800" />}
      </button>
      {showDropdown && createPortal(dropdownMenu, document.body)}
    </div>
  );
};
