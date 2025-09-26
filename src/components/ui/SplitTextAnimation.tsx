'use client';

import React, { useEffect, useState } from 'react';

interface SplitTextAnimationProps {
  text: string;
  className?: string;
  delay?: number;
}

export const SplitTextAnimation: React.FC<SplitTextAnimationProps> = ({ 
  text, 
  className = '', 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const characters = text.split('');

  return (
    <span className={`inline-block ${className}`}>
      {characters.map((char, index) => (
          <span
            key={index}
            className={`inline-block transition-all duration-400 ease-out ${
              isVisible 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-8'
            }`}
            style={{
              transitionDelay: `${index * 120}ms`,
            }}
          >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};
