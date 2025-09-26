'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LayoutTextFlipProps {
  text: string;
  words: string[];
  duration?: number;
  className?: string;
  wordsClassName?: string;
}

export const LayoutTextFlip: React.FC<LayoutTextFlipProps> = ({ 
  text, 
  words, 
  duration = 3000,
  className = '',
  wordsClassName = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsVisible(true);
      }, 300); // Half second for transition
      
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration]);

  return (
    <div className={cn("text-center", className)}>
      <span className="inline-block">
        {text}{' '}
        <span 
          className={cn(
            "inline-block transition-all duration-300 ease-in-out font-bold",
            wordsClassName,
            isVisible 
              ? "opacity-100 transform translate-y-0 scale-100" 
              : "opacity-0 transform -translate-y-2 scale-95"
          )}
        >
          {words[currentIndex]}
        </span>
      </span>
    </div>
  );
};
