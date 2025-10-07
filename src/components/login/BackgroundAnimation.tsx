'use client';

import React from 'react';

export const BackgroundAnimation: React.FC = React.memo(() => {
  return (
    <>
      {/* Geometric pattern background */}
      <div className="absolute inset-0 bg-geometric-pattern opacity-20"></div>
      
      {/* Dynamic mesh gradient */}
      <div className="absolute inset-0 bg-dynamic-mesh"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large floating shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rotate-45 rounded-lg blur-sm animate-float-slow"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-indigo-500/25 rotate-12 rounded-full blur-sm animate-float-medium"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-blue-600/15 rotate-45 rounded-lg blur-sm animate-float-fast"></div>
        
        {/* Medium shapes */}
        <div className="absolute top-1/3 right-20 w-20 h-20 bg-blue-400/30 rotate-45 rounded-lg blur-sm animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-16 h-16 bg-indigo-400/25 rotate-12 rounded-full blur-sm animate-float-medium"></div>
        <div className="absolute top-1/2 left-20 w-28 h-28 bg-blue-500/20 rotate-45 rounded-lg blur-sm animate-float-fast"></div>
        
        {/* Small accent shapes */}
        <div className="absolute top-16 right-1/4 w-12 h-12 bg-blue-300/35 rotate-45 rounded-lg blur-sm animate-float-medium"></div>
        <div className="absolute bottom-20 left-1/4 w-14 h-14 bg-indigo-300/30 rotate-12 rounded-full blur-sm animate-float-slow"></div>
        <div className="absolute top-2/3 right-10 w-18 h-18 bg-blue-400/25 rotate-45 rounded-lg blur-sm animate-float-fast"></div>
      </div>
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/15 via-transparent to-indigo-200/10 animate-gradient-shift"></div>
      
      {/* Subtle depth overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-300/8 via-transparent to-blue-100/5"></div>
    </>
  );
});

BackgroundAnimation.displayName = 'BackgroundAnimation';
