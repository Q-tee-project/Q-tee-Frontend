'use client';

import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  className?: string;
  isActive: boolean;
  speed?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  text, 
  className = '', 
  isActive,
  speed = 50 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isActive && currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (!isActive) {
      // Reset when not active
      setDisplayedText('');
      setCurrentIndex(0);
    }
  }, [isActive, currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayedText}
      {isActive && currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
};
