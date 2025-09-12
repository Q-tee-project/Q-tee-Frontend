'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <Header />

      {/* 메인 컨텐츠 영역 (사이드바 + 페이지 컨텐츠) */}
      <div className="flex-1 flex">
        {/* 사이드바 */}
        <Sidebar />

        {/* 페이지 컨텐츠 */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
