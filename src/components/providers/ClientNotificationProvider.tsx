'use client';

import React, { ReactNode } from 'react';
import { NotificationProvider } from '@/contexts/NotificationContext';

interface ClientNotificationProviderProps {
  children: ReactNode;
}

export const ClientNotificationProvider = ({ children }: ClientNotificationProviderProps) => {
  return <NotificationProvider>{children}</NotificationProvider>;
};
