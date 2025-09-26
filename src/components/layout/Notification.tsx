'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { VscBellDot } from 'react-icons/vsc';
import { LuX } from 'react-icons/lu';
import { FiCheck, FiBookOpen, FiSend, FiShoppingCart } from "react-icons/fi";
import { RiGroupLine } from "react-icons/ri";
import { MdOutlineNotificationImportant } from "react-icons/md";
import { useAuth } from '@/contexts/AuthContext';

// 알림 타입 정의
type TeacherNotificationType = 'assignment_created' | 'assignment_submitted' | 'message' | 'market_sale' | 'class_approval_request';
type StudentNotificationType = 'assignment_distributed' | 'grading_completed' | 'message' | 'class_approval_completed';
type NotificationType = TeacherNotificationType | StudentNotificationType;

interface Notification {
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

// 백엔드 API 인터페이스 (임시 구현)
interface NotificationAPI {
  getNotifications: (userType: 'teacher' | 'student') => Promise<Notification[]>;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteNotificationsByType: (type: NotificationType) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

const mockNotificationAPI: NotificationAPI = {
  getNotifications: async () => [],
  markAsRead: async () => {},
  deleteNotification: async () => {},
  deleteNotificationsByType: async () => {},
  deleteAllNotifications: async () => {}
};

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bellMenuRef: React.RefObject<HTMLDivElement | null>;
}

export default function NotificationPanel({ isOpen, onClose, bellMenuRef }: NotificationPanelProps) {
  const { userType } = useAuth();
  const router = useRouter();
  
  const typeMeta: Record<NotificationType, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
    // 선생님 알림 타입
    assignment_created: { label: '과제 생성 완료', icon: <FiCheck size={12} />, color: '#2AC951', bgColor: 'rgba(42, 201, 81, 0.1)' },
    assignment_submitted: { label: '과제 제출 알림', icon: <FiBookOpen size={12} />, color: '#2294E6', bgColor: 'rgba(34, 148, 230, 0.1)' },
    message: { label: '쪽지 알림', icon: <FiSend size={12} style={{ transform: 'translate(-1px, 1px)' }} />, color: '#FE4C4F', bgColor: 'rgba(254, 76, 79, 0.1)' },
    market_sale: { label: '마켓플레이스 판매', icon: <FiShoppingCart size={12} />, color: '#D4732E', bgColor: 'rgba(212, 115, 46, 0.1)' },
    class_approval_request: { label: '클래스 승인 신청', icon: <RiGroupLine size={12} />, color: '#A946FF', bgColor: 'rgba(169, 70, 255, 0.1)' },
    
    // 학생 알림 타입
    assignment_distributed: { label: '과제 배포 알림', icon: <FiBookOpen size={12} />, color: '#2294E6', bgColor: 'rgba(34, 148, 230, 0.1)' },
    grading_completed: { label: '채점 완료 알림', icon: <FiCheck size={12} />, color: '#2AC951', bgColor: 'rgba(42, 201, 81, 0.1)' },
    class_approval_completed: { label: '클래스 승인 완료', icon: <RiGroupLine size={12} />, color: '#A946FF', bgColor: 'rgba(169, 70, 255, 0.1)' },
  };

  // 알림 데이터 템플릿
  const notificationTemplates = {
    teacher: [
      { type: 'assignment_created' as NotificationType, title: '과제 생성 완료', content: '정수와 유리수에 대한 문제 생성이 완료되었습니다.', priority: 'medium' as const },
      { type: 'assignment_submitted' as NotificationType, title: '과제 제출 완료', content: 'A 클래스 한광구 학생이 정수와 유리수 과제를 제출했습니다.', priority: 'high' as const },
      { type: 'message' as NotificationType, title: 'A클래스 한광구 학생', content: '선생님 모르는 문제가 있어서 연락 드렸습니다. 정수와 유리수 과제를 풀다가 연락 드렸는데 혹시 확인 후 답변 주시면 감사하곘습니다.', priority: 'medium' as const },
      { type: 'market_sale' as NotificationType, title: '마켓플레이스 판매!', content: '정수와 유리수에 대한 문제지가 판매되었습니다.', priority: 'low' as const },    
      { type: 'class_approval_request' as NotificationType, title: 'A클래스 가입 신청', content: '최현범 학생이 A클래스 가입을 신청했습니다.', priority: 'medium' as const },
    ],
    student: [
      { type: 'assignment_distributed' as NotificationType, title: '국어 과제 배포', content: '정수와 유리수에 대한 문제가 배포되었습니다.', priority: 'high' as const },    
      { type: 'grading_completed' as NotificationType, title: '수학 과제 채점 완료', content: '제출하신 수학 과제 "정수와 유리수"의 채점이 완료되었습니다.', priority: 'high' as const },
      { type: 'message' as NotificationType, title: '이윤진 선생님', content: '그래 광구야 쪽지 잘 받았다. 늦게까지 열심히 공부했구나. 물어본 문제는 조금 더 고민해보고 다음 수업 시간에', priority: 'medium' as const },
      { type: 'class_approval_completed' as NotificationType, title: 'A클래스 가입 승인 완료', content: 'A클래스 가입 신청이 승인되었습니다. 이제 수업에 참여할 수 있습니다.', priority: 'high' as const },
    ]
  };

  // 알림 데이터 생성 함수
  const generateNotifications = (userType: 'teacher' | 'student'): Notification[] => {
    const baseTime = new Date('2024-01-15T10:30:00Z');
    const templates = notificationTemplates[userType];
    
    return templates.map((template, index) => {
      const timeOffset = index * 45;
      const createdAt = new Date(baseTime.getTime() - timeOffset * 60000).toISOString();
      
      const relatedIdMap = {
        assignment_created: 'assignment-created-123',
        assignment_submitted: 'assignment-submitted-456-class-1',
        message: userType === 'teacher' ? 'student-001' : 'teacher-001',
        market_sale: 'market-sale-789',
        class_approval_request: 'class-approval-request-abc-class-1',
        assignment_distributed: 'assignment-distributed-123',
        grading_completed: 'grading-completed-456',
        class_approval_completed: 'class-approval-completed-789',
      };
      
      return {
        id: `${userType}-${String(index + 1).padStart(3, '0')}`,
        type: template.type,
        title: template.title,
        content: template.content,
        createdAt,
        isRead: index === 4,
        priority: template.priority,
        ...(template.type === 'grading_completed' && { userId: userType === 'teacher' ? 'user-456' : 'teacher-456' }),
        ...(template.type === 'message' && { userId: userType === 'teacher' ? 'student-001' : 'teacher-001' }),
        ...(template.type !== 'message' && template.type !== 'grading_completed' && { relatedId: relatedIdMap[template.type] }),
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

  // 알림 클릭 시 페이지 이동 함수
  const handleNotificationClick = React.useCallback((notification: Notification) => {
    // 알림을 읽음 처리
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );
    
    // 알림 패널 닫기
    onClose();
    
    // 알림 타입별 페이지 이동
    switch (notification.type) {
      case 'assignment_created':
        // 과제 생성 완료 알림 -> question/bank
        router.push('/question/bank');
        break;
        
      case 'assignment_submitted':
        // 과제 제출 알림 -> class/[id] (제출한 학생이 속한 클래스 상세 페이지)
        // relatedId에서 클래스 ID를 추출 (예: "assignment-submitted-456-class-1" -> "1")
        const classId = notification.relatedId?.split('-').pop() || '1';
        router.push(`/class/${classId}`);
        break;
        
      case 'message':
        // 쪽지 알림 -> message/page.tsx
        router.push('/message');
        break;
        
      case 'market_sale':
        // 마켓 관련 알림 -> market/myMarket
        router.push('/market/myMarket');
        break;
        
      case 'class_approval_request':
        // 승인 신청 알림 -> class/[id] (승인 대기 탭)
        // relatedId에서 클래스 ID를 추출 (예: "class-approval-request-abc-class-1" -> "1")
        const approvalClassId = notification.relatedId?.split('-').pop() || '1';
        router.push(`/class/${approvalClassId}?tab=approval`);
        break;
        
      case 'assignment_distributed':
        // 학생용 과제 배포 알림 -> test 페이지
        router.push('/test');
        break;
        
      case 'grading_completed':
        // 학생용 채점 완료 알림 -> test 페이지
        router.push('/test');
        break;
        
      case 'class_approval_completed':
        // 학생용 클래스 승인 완료 알림 -> class 페이지
        router.push('/class');
        break;
        
      default:
        console.log('Unknown notification type:', notification.type);
    }
  }, [router, onClose]);

  // 알림 아이템 렌더링 함수
  const renderNotificationItem = (notification: Notification, meta: any, isExpanded: boolean, isMainItem: boolean = false) => {
    const handleClick = () => {
      if (isMainItem && !isExpanded) {
        handleExpandType(notification.type);
      } else {
        handleNotificationClick(notification);
      }
    };

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isMainItem && isExpanded) {
        handleRemoveNotification(notification.id);
      } else if (isMainItem && !isExpanded) {
        handleRemoveType(notification.type);
      } else {
        handleRemoveNotification(notification.id);
      }
    };

    return (
      <div
        className="flex items-center justify-between gap-4 p-4 cursor-pointer"
        onClick={handleClick}
      >
        {/* 좌측 아이콘과 배지 */}
        <div className="relative flex items-center justify-center w-10 h-10">
          <div className="absolute inset-0 rounded-full z-[1]" style={{ background: meta.bgColor }} />
          <div 
            className="relative flex items-center justify-center w-6 h-6 rounded-full text-white z-[2]" 
            style={{ background: meta.color, boxShadow: `0 2px 8px ${meta.color}30` }}
          >
            {meta.icon}
          </div>
        </div>
        
        {/* 중앙 텍스트 */}
        <div className="flex flex-col items-start flex-1 gap-1 min-w-0 max-w-80">
          <span className="text-sm font-semibold text-white leading-tight w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {notification.title}
          </span>
          <span className="text-xs text-gray-300 leading-snug w-full overflow-hidden text-ellipsis line-clamp-2 break-words">
            {notification.content ? (notification.content.length > 40 ? notification.content.substring(0, 60) + '...' : notification.content) : meta.label}
          </span>
        </div>
        
        {/* 우측 X 버튼 */}
        <button
          aria-label={isMainItem && isExpanded ? `${notification.title} 개별 삭제` : `${notification.title} ${isMainItem ? '전체' : '개별'} 삭제`}
          className="inline-flex items-center justify-center w-8 h-8 cursor-pointer text-white rounded-full transition-all duration-200"
          onClick={handleDelete}
        >
          <LuX size={18} />
        </button>
      </div>
    );
  };


  if (!isOpen) return null;

  return (
    <>
      {/* 전체 화면 오버레이 배경 */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999]"
        onClick={onClose}
      />
      {/* 알림 패널 */}
      <div
        role="menu"
        aria-label="알림"
        className="fixed top-5 right-5 w-[450px] h-[85vh] rounded-2xl p-0 z-[1000] overflow-hidden"
      >
        {/* 헤더와 리스트를 flex로 묶기 */}
        <div className="flex flex-col gap-4 h-full">
          {/* 헤더 */}
          <div className="flex justify-end items-center">
            <button
              aria-label={notifications.length === 0 ? "알림창 닫기" : "모든 알림 삭제"}
              onClick={notifications.length === 0 ? onClose : handleClearAll}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-800/80 to-gray-800/60 border border-white/20 text-white cursor-pointer"
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
                    // 선생님 알림 타입
                    assignment_created: [],
                    assignment_submitted: [],
                    message: [],
                    market_sale: [],
                    class_approval_request: [],
                    
                    // 학생 알림 타입
                    assignment_distributed: [],
                    grading_completed: [],
                    class_approval_completed: [],
                  },
          );

          const notificationEntries = Object.entries(groupedNotifications)
            .filter(([_, list]) => list.length > 0);

          return (
            <div
              className="notif-scroll flex flex-col gap-3 flex-1 overflow-y-auto"
              style={{
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
                <div className="flex flex-col items-center justify-center py-15 px-5 text-white text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-5">
                    <VscBellDot size={32} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    알람이 없습니다
                  </h3>
                  <p className="text-sm text-gray-300 opacity-80">
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
                    <div key={t} className="flex flex-col justify-end items-end">
                      {/* 알림 그룹 컨테이너 */}
                      <div
                        className="notif-item relative w-full flex flex-col gap-2.5 overflow-visible transition-all duration-300"
                        style={{
                          animationDelay: `${groupIndex * 60}ms`,
                          zIndex: isExpanded ? 10 : 1,
                        }}
                      >
                        {/* 우측 상단 버튼들 (박스 밖) - 아이폰 스타일 - 여러 개 알림일 때만 표시 */}
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

                        {/* 그룹 제목과 메인 알림 */}
                        <div className="flex flex-col bg-black/40 text-white rounded-2xl border border-white/10 transition-all duration-300 backdrop-blur-xl overflow-hidden">
                          <div className="relative">
                            {renderNotificationItem(latest, meta, isExpanded, true)}
                            {/* 여러 알림일 때 개수 표시 */}
                            {list.length > 1 && !isExpanded && (
                              <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 text-white text-xs font-semibold z-[3]">
                                {list.length}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                        {/* 확장된 알림들 (스르륵 스르륵 열림/닫힘) - 여러 개 알림일 때만 표시 */}
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
                        {list.slice(0, -1).reverse().map((notification, index) => (
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
                            {renderNotificationItem(notification, meta, isExpanded, false)}
                          </div>
                        ))}
                          </div>
                        )}
                    </div>
                  );
                })
              )}
            </div>
          );
        })()}
        </div>
      </div>
    </>
  );
}