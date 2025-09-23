'use client';

import React from 'react';
import { VscBellDot } from 'react-icons/vsc';
import { LuX } from 'react-icons/lu';
import { FiCheck, FiBookOpen, FiSend, FiShoppingCart } from "react-icons/fi";
import { RiGroupLine } from "react-icons/ri";
import { MdOutlineNotificationImportant } from "react-icons/md";
import { useAuth } from '@/contexts/AuthContext';

// ========================================
// 타입 정의 (백엔드와 공유되는 인터페이스)
// ========================================
type NotificationType = 'message' | 'schedule' | 'market' | 'missing' | 'graded' | 'problem';

interface Notification {
  id: string;                    // 알림 고유 ID
  type: NotificationType;        // 알림 타입
  title: string;                 // 알림 제목
  content?: string;              // 알림 상세 내용 (선택사항)
  createdAt: string;             // 생성일시 (ISO 8601 형식)
  isRead: boolean;               // 읽음 여부
  userId?: string;               // 관련 사용자 ID (선택사항)
  relatedId?: string;            // 관련 엔티티 ID (과제, 문제 등)
  priority?: 'low' | 'medium' | 'high'; // 알림 우선순위
}

// ========================================
// 백엔드 API 인터페이스 및 임시 구현
// ========================================
interface NotificationAPI {
  getNotifications: (userType: 'teacher' | 'student') => Promise<Notification[]>;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteNotificationsByType: (type: NotificationType) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

// TODO: 백엔드 개발자 - 실제 API로 대체 필요
const mockNotificationAPI: NotificationAPI = {
  getNotifications: async (userType: 'teacher' | 'student') => {
    // return await fetch(`/api/notifications?userType=${userType}`).then(res => res.json());
    return [];
  },
  markAsRead: async (notificationId: string) => {
    // return await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });
  },
  deleteNotification: async (notificationId: string) => {
    // return await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
  },
  deleteNotificationsByType: async (type: NotificationType) => {
    // return await fetch(`/api/notifications/type/${type}`, { method: 'DELETE' });
  },
  deleteAllNotifications: async () => {
    // return await fetch('/api/notifications', { method: 'DELETE' });
  }
};

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bellMenuRef: React.RefObject<HTMLLIElement | null>;
}

export default function NotificationPanel({ isOpen, onClose, bellMenuRef }: NotificationPanelProps) {
  const { userType } = useAuth();
  
  const typeMeta: Record<NotificationType, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
    message: { label: '쪽지 알림', icon: <FiSend size={12} />, color: '#FE4C4F', bgColor: 'rgba(254, 76, 79, 0.1)' },
    schedule: { label: '일정 알림', icon: <RiGroupLine size={12} />, color: '#FFD346', bgColor: 'rgba(255, 211, 70, 0.1)' },
    market: { label: '마켓 알림', icon: <FiShoppingCart size={12} />, color: '#D4732E', bgColor: 'rgba(212, 115, 46, 0.1)' },
    missing: { label: '미제출 알림', icon: <MdOutlineNotificationImportant size={12} />, color: '#A946FF', bgColor: 'rgba(169, 70, 255, 0.1)' },
    graded: { label: '채점 알림', icon: <FiBookOpen size={12} />, color: '#2294E6', bgColor: 'rgba(34, 148, 230, 0.1)' },
    problem: { label: '문제 알림', icon: <FiCheck size={12} />, color: '#2AC951', bgColor: 'rgba(42, 201, 81, 0.1)' },
  };

  // 알림 데이터 템플릿 (백엔드 연결 시 제거 예정)
  const notificationTemplates = {
    teacher: [
      { type: 'message' as NotificationType, title: 'A클래스 한광구 학생', content: '선생님 모르는 문제가 있어서 연락 드렸습니다. 정수와 유리수 과제를 풀다가 연락 드렸는데 혹 .....', priority: 'low' as const },
      { type: 'message' as NotificationType, title: 'A클래스 최현범 학생', content: '선생님 모르는 문제가 있어서 연락 드렸습니다. 정수와 유리수 과제를 풀다가 연락 드렸는데 혹 .....', priority: 'low' as const },
      { type: 'message' as NotificationType, title: 'A클래스 김보연 학생', content: '선생님 모르는 문제가 있어서 연락 드렸습니다. 정수와 유리수 과제를 풀다가 연락 드렸는데 혹 .....', priority: 'low' as const },
    ],
    student: [
      { type: 'message' as NotificationType, title: 'A클래스 한광구 학생', content: '선생님 모르는 문제가 있어서 연락 드렸습니다. 정수와 유리수 과제를 풀다가 연락 드렸는데 혹 .....', priority: 'low' as const },
    ]
  };

  // 알림 데이터 생성 함수 (반복문 최적화)
  const generateNotifications = (userType: 'teacher' | 'student'): Notification[] => {
    const baseTime = new Date('2024-01-15T10:30:00Z');
    const templates = notificationTemplates[userType];
    
    return templates.map((template, index) => {
      const timeOffset = index * 45; // 45분씩 차이
      const createdAt = new Date(baseTime.getTime() - timeOffset * 60000).toISOString();
      
      // 관련 ID 매핑
      const relatedIdMap = {
        graded: 'assignment-789',
        message: userType === 'teacher' ? 'student-001' : 'teacher-001',
        schedule: 'class-abc',
        problem: 'problem-123',
        market: 'market-item-xyz',
        missing: 'assignment-456',
      };
      
      return {
        id: `${userType}-${String(index + 1).padStart(3, '0')}`,
        type: template.type,
        title: template.title,
        content: template.content,
        createdAt,
        isRead: index === 4, // 마지막 항목만 읽음 처리
        priority: template.priority,
        ...(template.type === 'graded' && { userId: userType === 'teacher' ? 'user-456' : 'teacher-456' }),
        ...(template.type === 'message' && { userId: userType === 'teacher' ? 'student-001' : 'teacher-001' }),
        ...(template.type !== 'message' && template.type !== 'graded' && { relatedId: relatedIdMap[template.type] }),
      };
    });
  };

  // 선생님용 알림 데이터 (메모이제이션으로 무한 리렌더링 방지)
  const teacherNotifications: Notification[] = React.useMemo(() => 
    generateNotifications('teacher'), []);

  // 학생용 알림 데이터 (메모이제이션으로 무한 리렌더링 방지)
  const studentNotifications: Notification[] = React.useMemo(() => 
    generateNotifications('student'), []);

  // 사용자 역할에 따라 적절한 알림 데이터 선택
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const [expandedTypes, setExpandedTypes] = React.useState<Set<NotificationType>>(new Set());

  // ===== 백엔드 API 연결 시 수정할 부분 =====
  React.useEffect(() => {
    // TODO: 백엔드 개발자 - 실제 API 호출로 대체
    const loadNotifications = async () => {
      try {
        // const data = await mockNotificationAPI.getNotifications(userType);
        // setNotifications(data);
        
        // 임시 데이터 (백엔드 연결 전까지 사용)
        if (userType === 'teacher') {
          setNotifications(teacherNotifications);
        } else if (userType === 'student') {
          setNotifications(studentNotifications);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error('알림 로드 실패:', error);
        setNotifications([]);
      }
    };
    loadNotifications();
  }, [userType, teacherNotifications, studentNotifications]);

  // ===== 백엔드 API 연결 시 수정할 부분 =====
  const handleRemoveNotification = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // TODO: 백엔드 개발자 - API 호출 추가
    // mockNotificationAPI.deleteNotification(id);
  }, []);

  const handleClearAll = React.useCallback(() => {
    setNotifications([]);
    setExpandedTypes(new Set());
    // TODO: 백엔드 개발자 - API 호출 추가
    // mockNotificationAPI.deleteAllNotifications();
  }, []);

  const handleExpandType = React.useCallback((type: NotificationType) => {
    setExpandedTypes(prev => {
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
    setExpandedTypes(prev => {
      const newSet = new Set(prev);
      newSet.delete(type);
      return newSet;
    });
  }, []);

  const handleRemoveType = React.useCallback((type: NotificationType) => {
    setNotifications(prev => prev.filter(n => n.type !== type));
    setExpandedTypes(prev => {
      const newSet = new Set(prev);
      newSet.delete(type);
      return newSet;
    });
    // TODO: 백엔드 개발자 - API 호출 추가
    // mockNotificationAPI.deleteNotificationsByType(type);
  }, []);

  // 알림 아이콘 컴포넌트 (메모이제이션)
  const NotificationIcon = React.memo(({ meta, count }: { meta: any; count?: number }) => (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: meta.bgColor, zIndex: 1 }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: meta.color, color: '#FFFFFF', boxShadow: `0 2px 8px ${meta.color}30`, zIndex: 2 }}>
        {meta.icon}
      </div>
      {count && count > 1 && (
        <div style={{ position: 'absolute', top: '-4px', right: '-4px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: '#282828', color: '#FFFFFF', fontSize: '11px', fontWeight: '600', zIndex: 3 }}>
          {count}
        </div>
      )}
    </div>
  ));

  // 알림 텍스트 컴포넌트 (메모이제이션)
  const NotificationText = React.memo(({ notification, meta, isSummary = false }: { notification: Notification; meta: any; isSummary?: boolean }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, gap: '4px', minWidth: 0, maxWidth: '320px' }}>
      <span style={{ 
        fontSize: '14px', 
        fontWeight: '600',
        color: '#FFFFFF',
        lineHeight: '1.3',
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: isSummary ? 'wrap' : 'nowrap',
        ...(isSummary && { height: '36px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' })
      }}>
        {notification.title}
      </span>
      <span style={{ 
        fontSize: '12px', 
        color: '#D1D5DB',
        lineHeight: '1.4',
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        wordBreak: 'break-word',
      }}>
        {notification.content || meta.label}
      </span>
    </div>
  ));


  if (!isOpen) return null;

  return (
    <>
      {/* 전체 화면 오버레이 배경 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(2px)',
          zIndex: 999,
        }}
        onClick={onClose}
      />
      {/* 알림 패널 */}
      <div
        role="menu"
        aria-label="알림"
        style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '500px',
          maxHeight: '600px',
          borderRadius: '16px',
          padding: '20px',
          zIndex: 1000,
          overflow: 'hidden',
        }}
      >
        {/* 헤더 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          paddingBottom: '12px',
        }}>
          <button
            aria-label="모든 알림 삭제"
            onClick={handleClearAll}
            style={{
              all: 'unset',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              color: '#FFFFFF',
              cursor: 'pointer',
              borderRadius: '50%',
              background: `linear-gradient(135deg, rgba(38, 38, 38, 0.8) 0%, rgba(38, 38, 38, 0.6) 100%)`,
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, rgba(38, 38, 38, 0.9) 0%, rgba(38, 38, 38, 0.7) 100%)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, rgba(38, 38, 38, 0.8) 0%, rgba(38, 38, 38, 0.6) 100%)`;
            }}
          >
            <LuX size={18} />
          </button>
        </div>

        {(() => {
          const groupedNotifications = notifications.reduce<Record<NotificationType, Notification[]>>(
                  (acc, cur) => {
                    if (!acc[cur.type]) acc[cur.type] = [];
                    acc[cur.type].push(cur);
                    return acc;
                  },
                  {
                    message: [],
                    schedule: [],
                    market: [],
                    missing: [],
                    graded: [],
                    problem: [],
                  },
          );

          const notificationEntries = Object.entries(groupedNotifications)
            .filter(([_, list]) => list.length > 0);

          return (
            <div
              className="notif-scroll"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '520px',
                overflowY: 'auto',
                paddingRight: '4px',
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE and Edge
              }}
            >
              <style jsx>{`
                .notif-scroll::-webkit-scrollbar {
                  display: none; /* Chrome, Safari, Opera */
                }
                
                @keyframes slideInUp {
                  from {
                    opacity: 0;
                    transform: translateY(30px) scale(0.9);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0px) scale(1);
                  }
                }
                
                @keyframes slideOutUp {
                  from {
                    opacity: 1;
                    transform: translateY(0px) scale(1);
                  }
                  to {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                  }
                }
              `}</style>
              {notifications.length === 0 ? (
                // 알림이 없을 때
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 20px',
                    color: '#FFFFFF',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <VscBellDot size={32} color="#FFFFFF" />
                  </div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#FFFFFF',
                      marginBottom: '8px',
                    }}
                  >
                    알람이 없습니다
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#D1D5DB',
                      opacity: 0.8,
                    }}
                  >
                    새로운 알림이 오면 여기에 표시됩니다
                  </p>
                </div>
              ) : (
                // 통합된 알림 리스트 (위치 유지하면서 부드러운 애니메이션)
                notificationEntries.map(([typeKey, list], groupIndex) => {
                  const t = typeKey as NotificationType;
                  const meta = typeMeta[t];
                  const latest = list[list.length - 1];
                  const isExpanded = expandedTypes.has(t);
                  
                  return (
                    <div key={t} style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      alignItems: 'flex-end'
                    }}>
                      {/* 알림 그룹 컨테이너 */}
                      <div
                        className="notif-item"
                        style={{
                          position: 'relative',
                          animationDelay: `${groupIndex * 60}ms`,
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          zIndex: isExpanded ? 10 : 1,
                          overflow: 'visible',
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',  
                        }}
                      >
                        {/* 우측 상단 버튼들 (박스 밖) - 아이폰 스타일 */}
                        <div style={{
                          display: 'flex',
                          gap: '10px',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          opacity: isExpanded ? 1 : 0,
                          transform: isExpanded ? 'translateY(0px) scale(1)' : 'translateY(-20px) scale(0.9)',
                          maxHeight: isExpanded ? '40px' : '0px',
                          overflow: 'hidden',
                          pointerEvents: isExpanded ? 'auto' : 'none',
                        }}>
                          <button
                            aria-label="간략히 보기"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSummaryView(t);
                            }}
                            style={{
                              all: 'unset',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '6px 12px',
                              fontSize: '11px',
                              fontWeight: '500',
                              color: '#FFFFFF',
                              background: 'rgba(0, 0, 0, 0.6)',
                              borderRadius: '16px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              backdropFilter: 'blur(20px)',
                              border: '0.5px solid rgba(255, 255, 255, 0.1)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            간략히 보기
                          </button>
                          <button
                            aria-label={`${latest?.title} 닫기`}
                            style={{
                              all: 'unset',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              cursor: 'pointer',
                              color: '#FFFFFF',
                              borderRadius: '50%',
                              background: 'rgba(0, 0, 0, 0.6)',
                              transition: 'all 0.2s ease',
                              backdropFilter: 'blur(20px)',
                              border: '0.5px solid rgba(255, 255, 255, 0.1)',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveType(t);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                              e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <LuX size={16} />
                          </button>
                        </div>

                        {/* 그룹 제목과 메인 알림 */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'rgba(0, 0, 0, 0.4)',
                            color: '#FFFFFF',
                            borderRadius: '16px',
                            border: '0.5px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            backdropFilter: 'blur(20px)',
                            overflow: 'hidden',
                          }}
                          onClick={() => {
                            if (isExpanded) {
                              // 열린 상태: 링크 이동 (나중에 구현)
                              console.log(`Navigate to notification ${latest.id}`);
                            } else {
                              // 닫힌 상태: 리스트 확장
                              handleExpandType(t);
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
                          }}
                        >
                          {/* 메인 알림 아이템 */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '16px',
                            padding: '16px',
                            cursor: 'pointer',
                          }}>
                            {/* 좌측 아이콘과 배지 */}
                            <div
                              style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                              }}
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  borderRadius: '50%',
                                  background: meta.bgColor,
                                  zIndex: 1,
                                }}
                              />
                              <div
                                style={{
                                  position: 'relative',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: meta.color,
                                  color: '#FFFFFF',
                                  boxShadow: `0 2px 8px ${meta.color}30`,
                                  zIndex: 2,
                                }}
                              >
                                {meta.icon}
                              </div>
                              {list.length > 1 && !isExpanded && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: '#282828',
                                    color: '#FFFFFF',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    zIndex: 3,
                                  }}
                                >
                                  {list.length}
                                </div>
                              )}
                            </div>
                          
                            {/* 중앙 텍스트 */}
                            <div style={{ 
                                  display: 'flex',
                                  flexDirection: 'column',
                              alignItems: 'flex-start',
                              flex: 1,
                              gap: '4px',
                              minWidth: 0,
                              maxWidth: '320px',
                            }}>
                              <span style={{ 
                                fontSize: '14px', 
                                fontWeight: '600',
                                color: '#FFFFFF',
                                lineHeight: '1.3',
                                width: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {latest?.title}
                              </span>
                              <span style={{ 
                                fontSize: '12px', 
                                color: '#D1D5DB',
                                lineHeight: '1.4',
                                width: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                wordBreak: 'break-word',
                              }}>
                                {latest?.content || meta.label}
                              </span>
                            </div>
                            
                            {/* 우측 X 버튼 */}
                            <button
                              aria-label={isExpanded ? `${latest?.title} 개별 삭제` : `${latest?.title} 전체 삭제`}
                              style={{
                                all: 'unset',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                cursor: 'pointer',
                                color: '#FFFFFF',
                                borderRadius: '50%',
                                transition: 'all 0.2s ease',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isExpanded) {
                                  // 열린 상태: 개별 삭제 (메인 알림만 삭제)
                                  handleRemoveNotification(latest.id);
                                } else {
                                  // 닫힌 상태: 전체 삭제 (해당 타입의 모든 알림 삭제)
                                  handleRemoveType(t);
                                }
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `rgba(255, 255, 255, 0.1)`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = `transparent`;
                              }}
                            >
                              <LuX size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                        {/* 확장된 알림들 (스르륵 스르륵 열림/닫힘) */}
                        <div
                          style={{
                            overflow: 'hidden',
                            transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), margin-top 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), max-height 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            opacity: isExpanded ? 1 : 0,
                            transform: isExpanded ? 'translateY(0px) scale(1)' : 'translateY(-30px) scale(0.95)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            width: '100%',
                            marginTop: isExpanded ? '8px' : '0px',
                            maxHeight: isExpanded ? '500px' : '0px',
                          }}
                        >
                        {list.slice(0, -1).reverse().map((notification, index) => (
                          <div
                            key={notification.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '16px',
                              padding: '16px',
                              background: 'rgba(0, 0, 0, 0.4)',
                              borderRadius: '16px',
                              border: '0.5px solid rgba(255, 255, 255, 0.1)',
                              backdropFilter: 'blur(20px)',
                              cursor: 'pointer',
                              transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                              animation: isExpanded 
                                ? `slideInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.1}s both`
                                : `slideOutUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${(list.length - 2 - index) * 0.05}s both`,
                              transform: isExpanded ? 'translateY(0px)' : 'translateY(-20px)',
                              opacity: isExpanded ? 1 : 0,
                            }}
                            onClick={() => {
                              console.log(`Navigate to notification ${notification.id}`);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
                            }}
                          >
                            {/* 좌측 아이콘 */}
                            <div
                              style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                              }}
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  borderRadius: '50%',
                                  background: meta.bgColor,
                                  zIndex: 1,
                                }}
                              />
                              <div
                                style={{
                                  position: 'relative',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: meta.color,
                                  color: '#FFFFFF',
                                  boxShadow: `0 2px 8px ${meta.color}30`,
                                  zIndex: 2,
                                }}
                              >
                                {meta.icon}
                              </div>
                            </div>
                            
                            {/* 중앙 텍스트 */}
                            <div style={{ 
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              flex: 1,
                              gap: '4px',
                              minWidth: 0,
                              maxWidth: '320px',
                            }}>
                              <span style={{ 
                                fontSize: '14px', 
                                fontWeight: '600',
                                color: '#FFFFFF',
                                lineHeight: '1.3',
                                width: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {notification.title}
                              </span>
                              <span style={{ 
                                fontSize: '12px', 
                                color: '#D1D5DB',
                                lineHeight: '1.4',
                                width: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                wordBreak: 'break-word',
                              }}>
                                {notification.content || meta.label}
                              </span>
                            </div>
                            
                            {/* 우측 X 버튼 (개별 삭제) */}
                            <button
                              aria-label={`${notification.title} 개별 삭제`}
                              style={{
                                all: 'unset',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                cursor: 'pointer',
                                color: '#FFFFFF',
                                borderRadius: '50%',
                                transition: 'all 0.2s ease',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveNotification(notification.id);
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `rgba(255, 255, 255, 0.1)`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = `transparent`;
                              }}
                            >
                              <LuX size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })()}
      </div>
    </>
  );
}