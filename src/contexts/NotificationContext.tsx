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
            setNotifications(prev => {
              const existingIds = new Set(prev.map(n => n.id));
              const newNotifications = storedNotifications.filter(n => !existingIds.has(n.id));
              return [...newNotifications, ...prev];
            });
          }
        } catch (error) {
          console.error('저장된 알림 로드 실패:', error);
        }
      };

      loadStoredNotifications();

      // 알림 리스너 등록
      const handleNotification = (notification: SSENotification) => {
        console.log('새 알림 수신:', notification);
        setNotifications(prev => {
          if (prev.some(n => n.id === notification.id)) {
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
  const markAsRead = async (id: string) => {
    if (!userType || !userProfile) {
      return;
    }

    // 로컬 상태 먼저 업데이트
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );

    // 백엔드에 읽음 상태 전송
    try {
      const success = await notificationService.markAsRead(userType, userProfile.id, id);
      if (!success) {
        console.error(`Failed to mark notification ${id} as read on server`);
        // 실패 시 로컬 상태 롤백
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id ? { ...notification, read: false } : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    if (!userType || !userProfile) {
      return;
    }

    // 로컬 상태 먼저 업데이트
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    // 백엔드에 읽음 상태 전송
    try {
      const success = await notificationService.markAllAsRead(userType, userProfile.id);
      if (!success) {
        console.error('Failed to mark all notifications as read on server');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // 개별 알림 삭제
  const removeNotification = async (id: string, type: string) => {
    if (!userType || !userProfile) {
      console.log('[DEBUG] removeNotification: userType or userProfile not found. Aborting.');
      return;
    }
    console.log(`[DEBUG] removeNotification called with ID: ${id}, Type: ${type}`);
    try {
      const success = await notificationService.deleteNotification(userType, userProfile.id, type, id);
      console.log(`[DEBUG] API call success: ${success}`);

      if (success) {
        setNotifications(prev => {
          console.log('[DEBUG] State before deletion:', prev);
          const newState = prev.filter(n => n.id !== id);
          console.log('[DEBUG] State after deletion:', newState);
          return newState;
        });
      } else {
        console.error(`[DEBUG] Failed to delete notification ${id} from server (API returned not 'ok').`);
      }
    } catch (error) {
      console.error(`[DEBUG] Error during notification deletion API call:`, error);
    }
  };

  // 타입별 알림 삭제
  const removeNotificationsByType = async (type: string) => {
    if (!userType || !userProfile) {
      return;
    }

    // 로컬 상태 먼저 업데이트
    setNotifications(prev => prev.filter(n => n.type !== type));

    // 백엔드에서 삭제
    try {
      const success = await notificationService.deleteNotificationsByType(userType, userProfile.id, type);
      if (!success) {
        console.error(`Failed to delete ${type} notifications from server`);
        // 실패 시에는 페이지를 새로고침하거나 알림을 다시 불러와야 할 수 있음
      }
    } catch (error) {
      console.error(`Error deleting ${type} notifications:`, error);
    }
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
    markAllAsRead,
    removeNotification,
    removeNotificationsByType,
    clearAll,
    sendTestNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};