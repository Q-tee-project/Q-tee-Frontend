'use client';

import React from 'react';

interface JoinLoginLinkProps {
  onLoginClick: () => void;
}

export const JoinLoginLink: React.FC<JoinLoginLinkProps> = React.memo(({ onLoginClick }) => {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300 group cursor-pointer"
          onClick={onLoginClick}
        >
          <span className="text-sm text-gray-700 font-medium">이미 계정이 있으신가요?</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-200">
              로그인
            </span>
            <svg
              className="w-4 h-4 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
});

JoinLoginLink.displayName = 'JoinLoginLink';
