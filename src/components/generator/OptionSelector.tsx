import React from 'react';

interface OptionSelectorProps<T extends string | number> {
  options: readonly T[];
  selectedValue: T | null;
  onSelect: (value: T) => void;
  renderLabel?: (value: T) => string;
  className?: string;
}

export function OptionSelector<T extends string | number>({
  options,
  selectedValue,
  onSelect,
  renderLabel,
  className = '',
}: OptionSelectorProps<T>) {
  const chipBase =
    'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  const chipSelected = 'border-blue-600 bg-blue-50 text-blue-700';
  const chipUnselected = 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50';

  return (
    <div className={`flex flex-wrap justify-center gap-1 ${className}`}>
      {options.map((value) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={`${chipBase} ${selectedValue === value ? chipSelected : chipUnselected}`}
        >
          {renderLabel ? renderLabel(value) : value}
        </button>
      ))}
    </div>
  );
}
