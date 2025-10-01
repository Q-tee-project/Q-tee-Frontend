import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface GeneratorSectionProps {
  title: string;
  tooltipContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function GeneratorSection({
  title,
  tooltipContent,
  children,
  className,
}: GeneratorSectionProps) {
  return (
    <div className={`${className || ''} py-3`}>
      <div className="flex flex-row items-center justify-between pb-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        {tooltipContent && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">{tooltipContent}</div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="p-1">{children}</div>
    </div>
  );
}
