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
  markAllAsRead: () => void;
  removeNotification: (id: string, type: string) => void;
  removeNotificationsByType: (type: string) => void;
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
            20,
          );
          if (storedNotifications.length > 0) {
            setNotifications((prev) => {
              const existingIds = new Set(prev.map((n) => n.id));
              const newNotifications = storedNotifications.filter((n) => !existingIds.has(n.id));
              return [...newNotifications, ...prev];
            });
          }
        } catch (error) {
          // 저장된 알림 로드 실패는 조용히 처리
        }
      };

      loadStoredNotifications();

      // 알림 리스너 등록
      const handleNotification = (notification: SSENotification) => {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notification.id)) {
            return prev; // 이미 존재하면 상태 변경 안함
          }
          return [notification, ...prev];
        });
      };

      notificationService.addListener(handleNotification);

      return () => {
        clearInterval(connectionInterval);
        notificationService.removeListener(handleNotification);
        notificationService.disconnect();
        setIsConnected(false);
      };
    } else {
      // 로그아웃이나 인증 실패 시 연결 해제
      notificationService.disconnect();
      setIsConnected(false);
      setNotifications([]);
    }
  }, [isLoading, isAuthenticated, userType, userProfile]);

  // 읽지 않은 알림 개수 계산
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 알림 추가 (수동으로 알림을 추가해야 할 경우)
  const addNotification = (notification: SSENotification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  // 알림 읽음 처리
  const markAsRead = async (id: string) => {
    if (!userType || !userProfile) {
      return;
    }

    // 로컬 상태 먼저 업데이트
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );

    // 백엔드에 읽음 상태 전송
    try {
      const success = await notificationService.markAsRead(userType, userProfile.id, id);
      if (!success) {
        // 실패 시 로컬 상태 롤백
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id ? { ...notification, read: false } : notification,
          ),
        );
      }
    } catch (error) {
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    if (!userType || !userProfile) {
      return;
    }

    // 로컬 상태 먼저 업데이트
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));

    // 백엔드에 읽음 상태 전송
    try {
      const success = await notificationService.markAllAsRead(userType, userProfile.id);
      if (!success) {
      }
    } catch (error) {
    }
  };

  // 개별 알림 삭제
  const removeNotification = async (id: string, type: string) => {
    if (!userType || !userProfile) {
      return;
    }

    try {
      const success = await notificationService.deleteNotification(
        userType,
        userProfile.id,
        type,
        id,
      );

      if (success) {
        setNotifications((prev) => {
          const newState = prev.filter((n) => n.id !== id);

          return newState;
        });
      } else {
      }
    } catch (error) {}
  };

  // 타입별 알림 삭제
  const removeNotificationsByType = async (type: string) => {
    if (!userType || !userProfile) {
      return;
    }

    // 로컬 상태 먼저 업데이트
    setNotifications((prev) => prev.filter((n) => n.type !== type));

    // 백엔드에서 삭제
    try {
      const success = await notificationService.deleteNotificationsByType(
        userType,
        userProfile.id,
        type,
      );
      if (!success) {
        // 실패 시에는 페이지를 새로고침하거나 알림을 다시 불러와야 할 수 있음
      }
    } catch (error) {
    }
  };

  // 모든 알림 삭제
  const clearAll = async () => {
    if (userType && userProfile) {
      try {
        await notificationService.clearStoredNotifications(userType, userProfile.id);
      } catch (error) {
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
        } else {
        }
      } catch (error) {
      }
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    removeNotificationsByType,
    clearAll,
    sendTestNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
