'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { VscBellDot } from 'react-icons/vsc';
import { LuX } from 'react-icons/lu';
import { FiTrash2 } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { NotificationItem, Notification } from './NotificationItem';
import { NotificationType, notificationTypeMeta } from './notificationConfig';
import { convertSSEToUI, getNotificationRoute } from './notificationUtils';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bellMenuRef: React.RefObject<HTMLDivElement | null>;
}

export default function NotificationPanel({
  isOpen,
  onClose,
  bellMenuRef,
}: NotificationPanelProps) {
  const { userType } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [expandedTypes, setExpandedTypes] = React.useState<Set<NotificationType>>(new Set());

  // SSE 알림 데이터 가져오기
  const {
    notifications: sseNotifications,
    markAsRead: sseMarkAsRead,
    removeNotification,
    removeNotificationsByType,
    clearAll,
  } = useNotification();

  // SSE 알림을 UI 알림으로 변환
  React.useEffect(() => {
    const convertedNotifications = sseNotifications.map(convertSSEToUI);
    setNotifications(convertedNotifications);
  }, [sseNotifications]);

  // 알림 삭제 핸들러
  const handleRemoveNotification = React.useCallback(
    (notification: Notification) => {
      if (removeNotification) {
        removeNotification(notification.id, notification.type);
      }
    },
    [removeNotification],
  );

  // 전체 삭제 핸들러
  const handleClearAll = React.useCallback(() => {
    setNotifications([]);
    setExpandedTypes(new Set());
    if (clearAll) {
      clearAll();
    }
  }, [clearAll]);

  // 타입별 확장/축소 핸들러
  const handleExpandType = React.useCallback((type: NotificationType) => {
    setExpandedTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }, []);

  const handleSummaryView = React.useCallback((type: NotificationType) => {
    setExpandedTypes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(type);
      return newSet;
    });
  }, []);

  // 타입별 전체 삭제 핸들러
  const handleRemoveType = React.useCallback(
    (type: NotificationType) => {
      setNotifications((prev) => prev.filter((n) => n.type !== type));
      setExpandedTypes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(type);
        return newSet;
      });

      if (removeNotificationsByType) {
        removeNotificationsByType(type);
      }
    },
    [removeNotificationsByType],
  );

  // 알림 클릭 핸들러
  const handleNotificationClick = React.useCallback(
    (notification: Notification) => {
      onClose();
      const route = getNotificationRoute(notification);
      router.push(route);
    },
    [router, onClose],
  );

  // 알림 아이템 렌더링
  const renderNotificationItem = (
    notification: Notification,
    isExpanded: boolean,
    isMainItem: boolean = false,
    count?: number,
  ) => {
    const handleClick = () => {
      if (isMainItem && !isExpanded) {
        handleExpandType(notification.type);
      } else {
        handleNotificationClick(notification);
      }
    };

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isMainItem) {
        handleRemoveType(notification.type);
      } else {
        handleRemoveNotification(notification);
      }
    };

    return (
      <NotificationItem
        notification={notification}
        isExpanded={isExpanded}
        isMainItem={isMainItem}
        onClick={handleClick}
        onDelete={handleDelete}
        count={count}
      />
    );
  };

  if (!isOpen) return null;

  // 알림을 타입별로 그룹화
  const groupedNotifications = notifications.reduce<Record<NotificationType, Notification[]>>(
    (acc, cur) => {
      if (!acc[cur.type]) acc[cur.type] = [];
      acc[cur.type].push(cur);
      return acc;
    },
    {} as Record<NotificationType, Notification[]>,
  );

  const notificationEntries = Object.entries(groupedNotifications).filter(
    ([_, list]) => list.length > 0,
  );

  return (
    <>
      {/* 전체 화면 오버레이 배경 */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999]" onClick={onClose} />

      {/* 알림 패널 */}
      <div
        role="menu"
        aria-label="알림"
        className="fixed top-5 right-5 w-[450px] h-[85vh] rounded-2xl p-0 z-[1000] overflow-hidden"
      >
        <div className="flex flex-col gap-4 h-full">
          {/* 헤더 */}
          <div className="flex justify-between items-center">
            {notifications.length > 0 && (
              <button
                aria-label="모든 알림 삭제"
                onClick={handleClearAll}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-red-600/80 to-red-600/60 border border-white/20 text-white cursor-pointer hover:from-red-700/80 hover:to-red-700/60 transition-all duration-200"
              >
                <FiTrash2 size={16} />
              </button>
            )}

            <button
              aria-label="알림창 닫기"
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-800/80 to-gray-800/60 border border-white/20 text-white cursor-pointer hover:from-gray-700/80 hover:to-gray-700/60 transition-all duration-200"
            >
              <LuX size={18} />
            </button>
          </div>

          {/* 알림 리스트 */}
          <div className="notif-scroll flex flex-col gap-3 flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-15 px-5 text-white text-center">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-5">
                  <VscBellDot size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">알람이 없습니다</h3>
                <p className="text-sm text-gray-300 opacity-80">새로운 알림이 오면 여기에 표시됩니다</p>
              </div>
            ) : (
              notificationEntries.map(([typeKey, list], groupIndex) => {
                const t = typeKey as NotificationType;
                const meta = notificationTypeMeta[t];
                const latest = list[list.length - 1];
                const isExpanded = expandedTypes.has(t);

                return (
                  <div key={t} className="flex flex-col justify-end items-end">
                    {/* 알림 그룹 컨테이너 */}
                    <div
                      className="notif-item relative w-full flex flex-col gap-2.5 overflow-visible transition-all duration-300"
                      style={{
                        animationDelay: `${groupIndex * 60}ms`,
                        zIndex: isExpanded ? 10 : 1,
                      }}
                    >
                      {/* 확장 시 버튼들 */}
                      {list.length > 1 && (
                        <div
                          className="flex gap-2.5 justify-end items-center overflow-hidden transition-all duration-500"
                          style={{
                            opacity: isExpanded ? 1 : 0,
                            transform: isExpanded ? 'translateY(0px) scale(1)' : 'translateY(-20px) scale(0.9)',
                            maxHeight: isExpanded ? '40px' : '0px',
                            pointerEvents: isExpanded ? 'auto' : 'none',
                          }}
                        >
                          <button
                            aria-label="간략히 보기"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSummaryView(t);
                            }}
                            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-white bg-black/60 rounded-2xl cursor-pointer transition-all duration-200 backdrop-blur-xl border border-white/10"
                          >
                            간략히 보기
                          </button>
                          <button
                            aria-label={`${latest?.title} 닫기`}
                            className="inline-flex items-center justify-center w-7 h-7 cursor-pointer text-white rounded-full bg-black/60 transition-all duration-200 backdrop-blur-xl border border-white/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveType(t);
                            }}
                          >
                            <LuX size={16} />
                          </button>
                        </div>
                      )}

                      {/* 메인 알림 */}
                      <div className="flex flex-col bg-black/40 text-white rounded-2xl border border-white/10 transition-all duration-300 backdrop-blur-xl overflow-hidden">
                        <div className="relative">
                          {renderNotificationItem(latest, isExpanded, true, list.length)}
                        </div>
                      </div>
                    </div>

                    {/* 확장된 알림들 */}
                    {list.length > 1 && (
                      <div
                        className="overflow-hidden flex flex-col gap-2 w-full transition-all duration-500"
                        style={{
                          opacity: isExpanded ? 1 : 0,
                          transform: isExpanded ? 'translateY(0px) scale(1)' : 'translateY(-30px) scale(0.95)',
                          marginTop: isExpanded ? '8px' : '0px',
                          maxHeight: isExpanded ? '500px' : '0px',
                        }}
                      >
                        {list
                          .slice(0, -1)
                          .reverse()
                          .map((notification, index) => (
                            <div
                              key={notification.id}
                              className="bg-black/40 rounded-2xl border border-white/10 backdrop-blur-xl transition-all duration-500"
                              style={{
                                animation: isExpanded
                                  ? `slideInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.1}s both`
                                  : `slideOutUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${(list.length - 2 - index) * 0.05}s both`,
                                transform: isExpanded ? 'translateY(0px)' : 'translateY(-20px)',
                                opacity: isExpanded ? 1 : 0,
                              }}
                            >
                              {renderNotificationItem(notification, isExpanded, false)}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
