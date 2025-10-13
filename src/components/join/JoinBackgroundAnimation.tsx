'use client';

import React from 'react';

export const JoinBackgroundAnimation: React.FC = React.memo(() => {
  return (
    <>
      {/* Simplified geometric pattern background */}
      <div className="absolute inset-0 bg-geometric-pattern opacity-15"></div>

      {/* Simplified dynamic mesh gradient */}
      <div className="absolute inset-0 bg-dynamic-mesh"></div>

      {/* Reduced floating geometric shapes for better performance */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Only essential floating shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/15 rotate-45 rounded-lg blur-sm animate-float-slow"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-indigo-500/20 rotate-12 rounded-full blur-sm animate-float-medium"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-blue-600/10 rotate-45 rounded-lg blur-sm animate-float-fast"></div>
        
        {/* Reduced medium shapes */}
        <div className="absolute top-1/3 right-20 w-20 h-20 bg-blue-400/25 rotate-45 rounded-lg blur-sm animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-16 h-16 bg-indigo-400/20 rotate-12 rounded-full blur-sm animate-float-medium"></div>
      </div>

      {/* Simplified gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/10 via-transparent to-indigo-200/5"></div>

      {/* Subtle depth overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-300/5 via-transparent to-blue-100/3"></div>
    </>
  );
});

JoinBackgroundAnimation.displayName = 'JoinBackgroundAnimation';
