'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

interface ClientAuthProviderProps {
  children: ReactNode;
}

export const ClientAuthProvider = ({ children }: ClientAuthProviderProps) => {
  return <AuthProvider>{children}</AuthProvider>;
};
