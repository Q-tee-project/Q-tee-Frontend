import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';

interface RefreshButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  lastSyncTime?: Date | null;
  variant?: 'blue' | 'green';
  tooltipTitle?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
  lastSyncTime,
  variant = 'blue',
  tooltipTitle = '새로고침'
}) => {
  const colorClasses = {
    blue: 'hover:text-blue-600 hover:bg-blue-50',
    green: 'hover:text-green-600 hover:bg-green-50'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`p-2 text-gray-600 ${colorClasses[variant]} rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label="새로고침"
    >
      <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
    </button>
  );
};

export default RefreshButton;
