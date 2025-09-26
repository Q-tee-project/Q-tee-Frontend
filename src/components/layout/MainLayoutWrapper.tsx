'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import MainLayout from './MainLayout';

interface MainLayoutWrapperProps {
  children: React.ReactNode;
}

export default function MainLayoutWrapper({ children }: MainLayoutWrapperProps) {
  const pathname = usePathname();

  // login, join, 홈페이지는 레이아웃을 적용하지 않음
  const excludeLayoutPaths = ['/join', '/'];
  const shouldExcludeLayout = excludeLayoutPaths.includes(pathname);

  if (shouldExcludeLayout) {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}
