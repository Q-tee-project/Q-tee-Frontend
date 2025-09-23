'use client';

import React from 'react';
import { VscBellDot } from 'react-icons/vsc';
import { LuX } from 'react-icons/lu';
import { FiCheck, FiBookOpen, FiSend, FiShoppingCart, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { RiGroupLine } from "react-icons/ri";
import { MdOutlineNotificationImportant } from "react-icons/md";
import { useAuth } from '@/contexts/AuthContext';

// 백엔드 API 응답 구조에 맞춘 알림 타입 정의
type NotificationType = 'message' | 'schedule' | 'market' | 'missing' | 'graded' | 'problem';

// 실제 API 응답 구조 (백엔드 개발자 참고용)
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

// 백엔드 API 인터페이스 (실제 연결 시 사용)
interface NotificationAPI {
  // 알림 목록 조회
  getNotifications: (userType: 'teacher' | 'student') => Promise<Notification[]>;
  // 알림 읽음 처리
  markAsRead: (notificationId: string) => Promise<void>;
  // 알림 삭제
  deleteNotification: (notificationId: string) => Promise<void>;
  // 알림 타입별 삭제
  deleteNotificationsByType: (type: NotificationType) => Promise<void>;
  // 모든 알림 삭제
  deleteAllNotifications: () => Promise<void>;
}

// 임시 API 구현 (백엔드 연결 전까지 사용)
const mockNotificationAPI: NotificationAPI = {
  getNotifications: async (userType: 'teacher' | 'student') => {
    // 실제로는 API 호출
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
      { type: 'problem' as NotificationType, title: '문제 생성 완료!', content: '정수와 유리수에 대한 문제 생성이 완료되었습니다.', priority: 'medium' as const },
      { type: 'problem' as NotificationType, title: '문제 생성 완료!', content: '이차방정식 문제 생성이 완료되었습니다.', priority: 'medium' as const },
      { type: 'problem' as NotificationType, title: '문제 생성 완료!', content: '기하학 문제 생성이 완료되었습니다.', priority: 'medium' as const },
      { type: 'graded' as NotificationType, title: '문제 제출 완료!', content: 'A클래스 한광구 학생이 정수와 유리수 과제를 제출했습니다.', priority: 'high' as const },
      { type: 'message' as NotificationType, title: 'A클래스 한광구 학생', content: '선생님 모르는 문제가 있어서 연락 드렸습니다. 정수와 유리수 과제를 풀다가 연락 드렸는데 혹 .....', priority: 'low' as const },
      { type: 'schedule' as NotificationType, title: '클래스 가입 신청', content: '최현범 학생이 B클래스 가입을 신청했습니다.', priority: 'medium' as const },
      { type: 'market' as NotificationType, title: '마켓플레이스', content: '마켓에 등록한 중학교 1학년 수학 문제지가 판매되었습니다.', priority: 'low' as const },
    ],
    student: [
      { type: 'problem' as NotificationType, title: '과제 배포 알림', content: '정수와 유리수 문제가 배포되었습니다. 과제 목록에서 문제 응시 후 제출하세요.', priority: 'medium' as const },
      { type: 'problem' as NotificationType, title: '과제 배포 알림', content: '이차방정식 문제가 배포되었습니다. 과제 목록에서 문제 응시 후 제출하세요.', priority: 'medium' as const },
      { type: 'problem' as NotificationType, title: '과제 배포 알림', content: '기하학 문제가 배포되었습니다. 과제 목록에서 문제 응시 후 제출하세요.', priority: 'medium' as const },
      { type: 'graded' as NotificationType, title: '문제 채점 완료!', content: '정수와 유리수 문제 채점이 완료되었습니다. 과제 목록에서 결과를 확인하세요.', priority: 'high' as const },
      { type: 'message' as NotificationType, title: '이윤진 선생님', content: '그래 광구야 연락 잘 받았다. 늦게까지 공부하느라 고생이 많네... 보내준 문제는 선생님이 확인했....', priority: 'low' as const },
      { type: 'schedule' as NotificationType, title: '클래스 승인 완료!', content: '이윤진 선생님이 B클래스 가입을 승인했습니다.', priority: 'medium' as const },
      { type: 'missing' as NotificationType, title: '미제출 알림', content: '정수와 유리수 과제를 제출하지 않았습니다. 빠른 시일내에 응시 후 제출바랍니다.', priority: 'high' as const },
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

  const [expandedType, setExpandedType] = React.useState<NotificationType | null>(null);
  const [isSummaryView, setIsSummaryView] = React.useState(false);

  // 사용자 역할에 따라 알림 데이터 설정
  React.useEffect(() => {
    // 백엔드 연결 시: 실제 API 호출로 대체
    // const loadNotifications = async () => {
    //   try {
    //     const data = await mockNotificationAPI.getNotifications(userType);
    //     setNotifications(data);
    //   } catch (error) {
    //     console.error('알림 로드 실패:', error);
    //   }
    // };
    // loadNotifications();
    
    // 임시 데이터 (백엔드 연결 전까지 사용)
    if (userType === 'teacher') {
      setNotifications(teacherNotifications);
    } else if (userType === 'student') {
      setNotifications(studentNotifications);
    } else {
      setNotifications([]);
    }
  }, [userType, teacherNotifications, studentNotifications]);

  // 성능 최적화를 위한 콜백 메모이제이션
  const handleRemoveNotification = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // 백엔드 연결 시: mockNotificationAPI.deleteNotification(id);
  }, []);

  const handleClearAll = React.useCallback(() => {
    setNotifications([]);
    setExpandedType(null);
    setIsSummaryView(false);
    // 백엔드 연결 시: mockNotificationAPI.deleteAllNotifications();
  }, []);

  const handleExpandType = React.useCallback((type: NotificationType) => {
    if (expandedType === type) {
      setExpandedType(null);
      setIsSummaryView(false);
    } else {
      setExpandedType(type);
      setIsSummaryView(true);
    }
  }, [expandedType]);

  const handleSummaryView = React.useCallback(() => {
    setExpandedType(null);
    setIsSummaryView(false);
  }, []);

  const handleRemoveType = React.useCallback((type: NotificationType) => {
    setNotifications(prev => prev.filter(n => n.type !== type));
    if (expandedType === type) {
      setExpandedType(null);
      setIsSummaryView(false);
    }
    // 백엔드 연결 시: mockNotificationAPI.deleteNotificationsByType(type);
  }, [expandedType]);

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

  // 알림 아이템 렌더링 함수 (최적화)
  const renderNotificationItem = (notification: Notification, index: number, isExpanded: boolean = false) => {
    const meta = typeMeta[notification.type];
    
    return (
      <div
        key={notification.id}
        className="notif-item"
        style={{
          position: 'relative',
          animationDelay: `${index * 60}ms`,
          transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
          transition: 'all 0.3s ease',
          zIndex: isExpanded ? 10 : 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            background: `linear-gradient(135deg, rgba(38, 38, 38, 0.8) 0%, rgba(38, 38, 38, 0.6) 100%)`,
            color: '#FFFFFF',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(38, 38, 38, 0.3)',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, rgba(38, 38, 38, 0.9) 0%, rgba(38, 38, 38, 0.7) 100%)`;
            e.currentTarget.style.borderColor = 'rgba(38, 38, 38, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `linear-gradient(135deg, rgba(38, 38, 38, 0.8) 0%, rgba(38, 38, 38, 0.6) 100%)`;
            e.currentTarget.style.borderColor = 'rgba(38, 38, 38, 0.3)';
          }}
        >
          <NotificationIcon meta={meta} />
          <NotificationText notification={notification} meta={meta} />
          <button
            aria-label={`${notification.title} 닫기`}
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
            onClick={() => handleRemoveNotification(notification.id)}
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
    );
  };

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
          marginBottom: '16px',
          paddingBottom: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isSummaryView && (
              <button
                aria-label="간략히 보기"
                onClick={handleSummaryView}
                style={{
                  all: 'unset',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#FFFFFF',
                  background: `linear-gradient(135deg, rgba(38, 38, 38, 0.8) 0%, rgba(38, 38, 38, 0.6) 100%)`,
                  borderRadius: '20px',
                  cursor: 'pointer',
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
                간략히 보기
              </button>
            )}
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
                scrollbarWidth: 'thin', // Firefox
                scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent', // Firefox
                msOverflowStyle: 'auto', // IE and Edge
              }}
            >
              <style jsx>{`
                .notif-scroll::-webkit-scrollbar {
                  width: 6px; /* Chrome, Safari, Opera */
                }
                .notif-scroll::-webkit-scrollbar-track {
                  background: transparent;
                }
                .notif-scroll::-webkit-scrollbar-thumb {
                  background: rgba(255, 255, 255, 0.3);
                  border-radius: 3px;
                }
                .notif-scroll::-webkit-scrollbar-thumb:hover {
                  background: rgba(255, 255, 255, 0.5);
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
                    background: `linear-gradient(135deg, rgba(38, 38, 38, 0.8) 0%, rgba(38, 38, 38, 0.6) 100%)`,
                    borderRadius: '12px',
                    border: '1px solid rgba(38, 38, 38, 0.3)',
                    backdropFilter: 'blur(10px)',
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
              ) : isSummaryView && expandedType ? (
                // B 리스트 (상세 보기)
                <>
                  {groupedNotifications[expandedType]?.map((notification, index) => 
                    renderNotificationItem(notification, index)
                  )}
                  {/* 다른 타입들의 요약 보기 */}
                  {notificationEntries
                    .filter(([typeKey]) => typeKey !== expandedType)
                    .map(([typeKey, list], groupIndex) => {
                      const t = typeKey as NotificationType;
                      const meta = typeMeta[t];
                      const latest = list[list.length - 1];
                      
                      return (
                        <div
                          key={t}
                          className="notif-item"
                          style={{
                            position: 'relative',
                            animationDelay: `${(groupIndex + (groupedNotifications[expandedType]?.length || 0)) * 60}ms`,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '16px',
                              background: `linear-gradient(135deg, rgba(38, 38, 38, 0.8) 0%, rgba(38, 38, 38, 0.6) 100%)`,
                              color: '#FFFFFF',
                              padding: '16px',
                              borderRadius: '12px',
                              border: '1px solid rgba(38, 38, 38, 0.3)',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              backdropFilter: 'blur(10px)',
                            }}
                            onClick={() => handleExpandType(t)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = `linear-gradient(135deg, rgba(38, 38, 38, 0.9) 0%, rgba(38, 38, 38, 0.7) 100%)`;
                              e.currentTarget.style.borderColor = 'rgba(38, 38, 38, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = `linear-gradient(135deg, rgba(38, 38, 38, 0.8) 0%, rgba(38, 38, 38, 0.6) 100%)`;
                              e.currentTarget.style.borderColor = 'rgba(38, 38, 38, 0.3)';
                            }}
                          >
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
                              {/* 큰 원 (10% 투명도) */}
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  borderRadius: '50%',
                                  background: meta.bgColor,
                                  zIndex: 1,
                                }}
                              />
                              {/* 작은 원 */}
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
                              {list.length > 1 && (
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
                              minWidth: 0, // flex item이 축소될 수 있도록
                              maxWidth: '320px', // 최대 너비 제한
                            }}>
                              <span style={{ 
                                fontSize: '14px', 
                                fontWeight: '600',
                                color: '#FFFFFF',
                                lineHeight: '1.3',
                                width: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'wrap',
                                height: '36px', // 두 줄 높이 (14px * 1.3 * 2)
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
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
                              aria-label={`${latest?.title} 닫기`}
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
                                handleRemoveType(t);
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
                      );
                    })}
                </>
              ) : (
                // A 리스트 (요약 보기)
                notificationEntries.map(([typeKey, list], groupIndex) => {
                  const t = typeKey as NotificationType;
                  const meta = typeMeta[t];
                  const latest = list[list.length - 1];
                  const isExpanded = expandedType === t;
                  
                  // 1개만 있을 때는 바로 리스트로 보여주기
                  if (list.length === 1) {
                    return renderNotificationItem(latest, groupIndex);
                  }
                  
                  return (
                    <div
                      key={t}
                      className="notif-item"
                      style={{
                        position: 'relative',
                        animationDelay: `${groupIndex * 60}ms`,
                        transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.3s ease',
                        zIndex: isExpanded ? 10 : 1,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          background: `linear-gradient(135deg, rgba(38, 38, 38, 0.8) 0%, rgba(38, 38, 38, 0.6) 100%)`,
                          color: '#FFFFFF',
                          padding: '16px',
                          borderRadius: '12px',
                          border: '1px solid rgba(38, 38, 38, 0.3)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          backdropFilter: 'blur(10px)',
                        }}
                        onClick={() => handleExpandType(t)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `linear-gradient(135deg, rgba(38, 38, 38, 0.9) 0%, rgba(38, 38, 38, 0.7) 100%)`;
                          e.currentTarget.style.borderColor = 'rgba(38, 38, 38, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = `linear-gradient(135deg, rgba(38, 38, 38, 0.8) 0%, rgba(38, 38, 38, 0.6) 100%)`;
                          e.currentTarget.style.borderColor = 'rgba(38, 38, 38, 0.3)';
                        }}
                      >
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
                          {/* 큰 원 (10% 투명도) */}
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              borderRadius: '50%',
                              background: meta.bgColor,
                              zIndex: 1,
                            }}
                          />
                          {/* 작은 원 */}
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
                        </div>
                        
                        {/* 중앙 텍스트 */}
                        <div style={{ 
                              display: 'flex',
                              flexDirection: 'column',
                          alignItems: 'flex-start',
                          flex: 1,
                          gap: '4px',
                          minWidth: 0, // flex item이 축소될 수 있도록
                          maxWidth: '320px', // 최대 너비 제한
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
                          aria-label={`${latest?.title} 닫기`}
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
                            handleRemoveType(t);
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

/*
=== 백엔드 개발자 가이드 ===

1. API 엔드포인트 구현 필요:
   - GET /api/notifications?userType={teacher|student} - 알림 목록 조회
   - PATCH /api/notifications/{id}/read - 알림 읽음 처리
   - DELETE /api/notifications/{id} - 개별 알림 삭제
   - DELETE /api/notifications/type/{type} - 타입별 알림 삭제
   - DELETE /api/notifications - 모든 알림 삭제

2. 데이터베이스 스키마 참고:
   - notifications 테이블에 위의 Notification 인터페이스 구조로 데이터 저장
   - userType에 따라 다른 알림 데이터 반환

3. 연결 방법:
   - mockNotificationAPI 객체의 주석을 해제하고 실제 API 호출로 변경
   - generateNotifications 함수와 임시 데이터 생성 로직 제거
   - useEffect에서 실제 API 호출 코드 활성화

4. 성능 최적화:
   - React.memo와 useCallback으로 최적화 완료
   - 불필요한 리렌더링 방지
   - 컴포넌트 분리로 코드 가독성 향상

5. 알림 타입별 처리:
   - message: 쪽지 관련 알림
   - schedule: 일정/클래스 관련 알림  
   - market: 마켓플레이스 관련 알림
   - missing: 미제출 과제 알림
   - graded: 채점 완료 알림
   - problem: 문제 생성/배포 알림
*/
