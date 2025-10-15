'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: string;
  variant?: 'question' | 'class' | 'market' | 'test' | 'default' ;
  children?: ReactNode;
};

export function PageHeader({
  title,
  description,
  icon,
  variant = 'default',
  children
}: PageHeaderProps) {
  const variantStyles = {
    question: 'from-blue-500/10 border-blue-500/20 text-blue-600',
    class: 'from-green-500/10 border-green-500/20 text-green-600', 
    market: 'from-gray-500/10 border-gray-500/20 text-gray-600',
    dashboard: 'from-gray-500/10 border-gray-500/20 text-gray-600',
    test: 'from-purple-500/10 border-purple-500/20 text-purple-600',
    default: 'from-gray-500/10 border-gray-500/20 text-gray-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon && (
            <div
              className={cn(
                'relative flex items-center justify-center w-11 h-11',
                'border-[1.5px] rounded-xl bg-gradient-to-br',
                variantStyles[variant],
                'dark:from-blue-500/20 dark:border-blue-500/30 dark:text-blue-400'
              )}
            >
              <div className="text-xl">{icon}</div>
            </div>
          )}
          <div className={cn('ml-4', !icon && 'ml-0')}>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
            )}
          </div>
        </div>
        {children && (
          <div className="flex items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}