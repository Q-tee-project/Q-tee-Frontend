'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { notificationService, SSENotification } from '@/services/notificationService';

interface NotificationContextType {
  notifications: SSENotification[];
  unreadCount: number;
  isConnected: boolean;
  addNotification: (notification: SSENotification) => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  sendTestNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { isAuthenticated, userType, userProfile, isLoading } = useAuth();
  const [notifications, setNotifications] = useState<SSENotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // SSE 연결 관리
  useEffect(() => {
    if (!isLoading && isAuthenticated && userType && userProfile) {
      console.log(`SSE 연결 시작: ${userType} ${userProfile.id}`);

      // SSE 연결
      notificationService.connect(userType, userProfile.id);

      // 연결 상태 체크
      const checkConnection = () => {
        setIsConnected(notificationService.isConnected());
      };

      const connectionInterval = setInterval(checkConnection, 1000);

      // 저장된 알림 가져오기 (오프라인 중 놓친 알림들)
      const loadStoredNotifications = async () => {
        try {
          const storedNotifications = await notificationService.getStoredNotifications(
            userType,
            userProfile.id,
            20
          );
          if (storedNotifications.length > 0) {
            console.log(`저장된 알림 ${storedNotifications.length}개 로드`);
            setNotifications(prev => [...storedNotifications, ...prev]);
          }
        } catch (error) {
          console.error('저장된 알림 로드 실패:', error);
        }
      };

      loadStoredNotifications();

      // 알림 리스너 등록
      const handleNotification = (notification: SSENotification) => {
        console.log('새 알림 수신:', notification);
        setNotifications(prev => [notification, ...prev]);
      };

      notificationService.addListener(handleNotification);

      return () => {
        clearInterval(connectionInterval);
        notificationService.removeListener(handleNotification);
        notificationService.disconnect();
        setIsConnected(false);
        console.log('SSE 연결 해제');
      };
    } else {
      // 로그아웃이나 인증 실패 시 연결 해제
      notificationService.disconnect();
      setIsConnected(false);
      setNotifications([]);
    }
  }, [isLoading, isAuthenticated, userType, userProfile]);

  // 읽지 않은 알림 개수 계산
  const unreadCount = notifications.filter(n => !n.read).length;

  // 알림 추가 (수동으로 알림을 추가해야 할 경우)
  const addNotification = (notification: SSENotification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  // 알림 읽음 처리
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // 개별 알림 삭제
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // 모든 알림 삭제
  const clearAll = async () => {
    if (userType && userProfile) {
      try {
        await notificationService.clearStoredNotifications(userType, userProfile.id);
      } catch (error) {
        console.error('서버 알림 삭제 실패:', error);
      }
    }
    setNotifications([]);
  };

  // 테스트 알림 전송
  const sendTestNotification = async () => {
    if (userType && userProfile) {
      try {
        const success = await notificationService.sendTestNotification(userType, userProfile.id);
        if (success) {
          console.log('테스트 알림 전송 성공');
        } else {
          console.error('테스트 알림 전송 실패');
        }
      } catch (error) {
        console.error('테스트 알림 전송 에러:', error);
      }
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    removeNotification,
    clearAll,
    sendTestNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};