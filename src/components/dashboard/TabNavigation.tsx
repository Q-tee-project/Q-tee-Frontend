'use client';

import React from 'react';

interface TabNavigationProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const TabNavigation = ({ selectedTab, setSelectedTab }: TabNavigationProps) => {
  return (
    <div className="flex gap-2 border-b border-gray-200">
      <button
        onClick={() => setSelectedTab('클래스 관리')}
        className={`px-6 py-3 text-sm font-medium transition-all duration-200 relative ${
          selectedTab === '클래스 관리'
            ? 'text-[#0072CE]'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        클래스 관리
        {selectedTab === '클래스 관리' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0072CE]" />
        )}
      </button>
      <button
        onClick={() => setSelectedTab('마켓 관리')}
        className={`px-6 py-3 text-sm font-medium transition-all duration-200 relative ${
          selectedTab === '마켓 관리'
            ? 'text-[#0072CE]'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        마켓 관리
        {selectedTab === '마켓 관리' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0072CE]" />
        )}
      </button>
    </div>
  );
};

export default TabNavigation;
