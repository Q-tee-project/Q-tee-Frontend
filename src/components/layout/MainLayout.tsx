'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import FixedNotificationIcon from './FixedNotificationIcon';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <Sidebar onToggle={setIsSidebarOpen} />

      {/* 메인 컨텐츠 영역 */}
      <main className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-[240px]' : 'ml-[60px]'}`}>
        {children}
      </main>

      {/* 고정 알림 아이콘 */}
      <FixedNotificationIcon />
    </div>
  );
}
