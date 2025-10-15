import React from 'react';
import { LuX } from 'react-icons/lu';
import { NotificationType, notificationTypeMeta, colorClassMap } from './notificationConfig';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content?: string;
  createdAt: string;
  isRead: boolean;
  userId?: string;
  relatedId?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface NotificationItemProps {
  notification: Notification;
  isExpanded: boolean;
  isMainItem: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  count?: number;
}

export function NotificationItem({
  notification,
  isExpanded,
  isMainItem,
  onClick,
  onDelete,
  count,
}: NotificationItemProps) {
  const meta = notificationTypeMeta[notification.type];
  const colors = colorClassMap[meta.colorClass];

  // 시간 포맷 함수
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;

    // 7일 이상이면 날짜 표시
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 cursor-pointer" onClick={onClick}>
      {/* 좌측 아이콘과 배지 */}
      <div className="relative flex items-center justify-center w-10 h-10">
        <div className="absolute inset-0 rounded-full z-[1]" style={{ background: colors.bgColor }} />
        <div
          className="relative flex items-center justify-center w-6 h-6 rounded-full text-white z-[2]"
          style={{ background: colors.color, boxShadow: `0 2px 8px ${colors.color}30` }}
        >
          {meta.icon}
        </div>
        {/* 알림 개수 배지 */}
        {count && count > 1 && !isExpanded && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 text-white text-xs font-semibold z-[3]">
            {count}
          </div>
        )}
      </div>

      {/* 중앙 텍스트 */}
      <div className="flex flex-col items-start flex-1 gap-1 min-w-0 max-w-80">
        <div className="flex items-center justify-between w-full gap-2">
          <span className="text-sm font-semibold text-white leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
            {notification.title}
          </span>
          <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
            {formatTimestamp(notification.createdAt)}
          </span>
        </div>
        <span className="text-xs text-gray-300 leading-snug w-full overflow-hidden text-ellipsis line-clamp-2 break-words">
          {notification.content
            ? notification.content.length > 40
              ? notification.content.substring(0, 60) + '...'
              : notification.content
            : meta.label}
        </span>
      </div>

      {/* 우측 X 버튼 */}
      <button
        aria-label={
          isMainItem ? `${notification.type} 알림 전체 삭제` : `${notification.title} 개별 삭제`
        }
        className="inline-flex items-center justify-center w-8 h-8 cursor-pointer text-white rounded-full transition-all duration-200"
        onClick={onDelete}
      >
        <LuX size={18} />
      </button>
    </div>
  );
}
