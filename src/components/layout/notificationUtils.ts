import {
  SSENotification,
  MessageNotificationData,
  ProblemGenerationData,
  ProblemRegenerationData,
  AssignmentSubmittedData,
  AssignmentDeployedData,
  ClassJoinRequestData,
  ClassApprovedData,
  GradingUpdatedData,
  MarketSaleData,
  MarketNewProductData,
} from '@/services/notificationService';
import { Notification } from './NotificationItem';
import { NotificationType } from './notificationConfig';

// 과목명 변환 함수
const getSubjectName = (subject: string): string => {
  const subjectMap: { [key: string]: string } = {
    math: '수학',
    korean: '국어',
    english: '영어',
  };
  return subjectMap[subject] || subject;
};

// SSE 알림을 UI 형태로 변환하는 함수
export const convertSSEToUI = (sseNotification: SSENotification): Notification => {
  const baseNotification = {
    id: sseNotification.id,
    type: sseNotification.type as NotificationType,
    createdAt: sseNotification.timestamp,
    isRead: sseNotification.read,
    priority: 'medium' as const,
  };

  switch (sseNotification.type) {
    case 'message': {
      const data = sseNotification.data as MessageNotificationData;
      return {
        ...baseNotification,
        title: `${data.sender_name} ${data.sender_type === 'teacher' ? '선생님' : '학생'}`,
        content: data.preview,
        userId: data.sender_id.toString(),
        relatedId: data.message_id.toString(),
      };
    }

    case 'problem_generation': {
      const data = sseNotification.data as ProblemGenerationData;
      return {
        ...baseNotification,
        title: `${getSubjectName(data.subject)} 문제 생성 완료`,
        content: `${data.worksheet_title} (${data.problem_count}문제)`,
        relatedId: data.worksheet_id.toString(),
        priority: 'high' as const,
      };
    }

    case 'problem_regeneration': {
      const data = sseNotification.data as ProblemRegenerationData;
      return {
        ...baseNotification,
        title: `${getSubjectName(data.subject)} 문제 재생성 완료`,
        content: `${data.worksheet_title} (문제 ${data.problem_number})`,
        relatedId: data.worksheet_id.toString(),
        priority: 'high' as const,
      };
    }

    case 'problem_generation_failed': {
      const data = sseNotification.data as ProblemGenerationData;
      return {
        ...baseNotification,
        title: `${getSubjectName(data.subject)} 문제 생성 실패`,
        content: data.error_message || '문제 생성에 실패했습니다',
        relatedId: data.worksheet_id.toString(),
        priority: 'high' as const,
      };
    }

    case 'problem_regeneration_failed': {
      const data = sseNotification.data as ProblemRegenerationData;
      return {
        ...baseNotification,
        title: `${getSubjectName(data.subject)} 문제 재생성 실패`,
        content: data.error_message || '문제 재생성에 실패했습니다',
        relatedId: data.worksheet_id.toString(),
        priority: 'high' as const,
      };
    }

    case 'assignment_submitted': {
      const data = sseNotification.data as AssignmentSubmittedData;
      return {
        ...baseNotification,
        title: '과제 제출 완료',
        content: `${data.student_name} 학생이 ${data.assignment_title} 과제를 제출했습니다`,
        relatedId: data.class_id.toString(),
        priority: 'high' as const,
      };
    }

    case 'assignment_deployed': {
      const data = sseNotification.data as AssignmentDeployedData;
      return {
        ...baseNotification,
        title: '과제 배포 알림',
        content: `${data.assignment_title} 과제가 배포되었습니다`,
        relatedId: data.assignment_id.toString(),
        priority: 'high' as const,
      };
    }

    case 'class_join_request': {
      const data = sseNotification.data as ClassJoinRequestData;
      return {
        ...baseNotification,
        title: '클래스 가입 요청',
        content: `${data.student_name} 학생이 ${data.class_name} 클래스 가입을 신청했습니다`,
        relatedId: data.class_id.toString(),
      };
    }

    case 'class_approved': {
      const data = sseNotification.data as ClassApprovedData;
      return {
        ...baseNotification,
        title: '클래스 승인 완료',
        content: `${data.class_name} 클래스 가입이 승인되었습니다`,
        relatedId: data.class_id.toString(),
        priority: 'high' as const,
      };
    }

    case 'grading_updated': {
      const data = sseNotification.data as GradingUpdatedData;
      return {
        ...baseNotification,
        title: '채점 수정 알림',
        content: `${data.assignment_title} 과제의 채점이 수정되었습니다 (${data.score}점)`,
        relatedId: data.assignment_id.toString(),
        priority: 'high' as const,
      };
    }

    case 'market_sale': {
      const data = sseNotification.data as MarketSaleData;
      return {
        ...baseNotification,
        title: '마켓 판매 알림',
        content: `${data.product_title}이(가) 판매되었습니다 (${data.amount}P)`,
        relatedId: data.product_id.toString(),
      };
    }

    case 'market_new_product': {
      const data = sseNotification.data as MarketNewProductData;
      return {
        ...baseNotification,
        title: '마켓 신상품 알림',
        content: `${data.seller_name}님이 새 상품을 등록했습니다: ${data.product_title}`,
        relatedId: data.product_id.toString(),
      };
    }

    default:
      return {
        ...baseNotification,
        title: '새 알림',
        content: JSON.stringify(sseNotification.data),
      };
  }
};

// 알림 클릭 시 이동할 경로 결정
export const getNotificationRoute = (notification: Notification): string => {
  switch (notification.type) {
    case 'message':
      return '/message';

    case 'problem_generation':
    case 'problem_regeneration':
    case 'problem_generation_failed':
    case 'problem_regeneration_failed':
    case 'assignment_created':
      return '/question/bank';

    case 'assignment_submitted':
      const classId = notification.relatedId?.split('-').pop() || '1';
      return `/class/${classId}`;

    case 'assignment_deployed':
    case 'assignment_distributed':
    case 'grading_completed':
    case 'grading_updated':
      return '/test';

    case 'class_join_request':
    case 'class_approval_request':
      const approvalClassId = notification.relatedId?.split('-').pop() || '1';
      return `/class/${approvalClassId}?tab=approval`;

    case 'class_approved':
    case 'class_approval_completed':
      return '/class';

    case 'market_sale':
      return '/market/my';

    case 'market_new_product':
      return '/market';

    default:
      return '/';
  }
};
