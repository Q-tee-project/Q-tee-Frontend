import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`p-2 text-gray-600 ${colorClasses[variant]} rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="text-center flex-1">
              <div className="font-semibold text-sm text-blue-900">{tooltipTitle}</div>
              <div className="text-xs text-blue-600 mt-1">
                마지막 동기화: {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : '없음'}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RefreshButton;
