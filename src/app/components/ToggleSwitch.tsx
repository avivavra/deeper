import React from 'react';
import { Direction } from '../pages/storage-dashboard/models';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
  children?: React.ReactNode;
  direction: Direction;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, className, children, direction }) => {
  return (
    <div className={`relative inline-flex items-center ${className}`} onClick={onChange}>
      <span className={`w-8 h-8 bg-white rounded-full shadow-md transform transition-transform ${checked ? (direction === 'rtl' ? '-translate-x-8' : 'translate-x-8') : ''}`}></span>
      {children}
    </div>
  );
};
