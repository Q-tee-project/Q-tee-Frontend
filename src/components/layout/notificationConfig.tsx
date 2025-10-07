import React from 'react';
import { FiCheck, FiBookOpen, FiSend, FiShoppingCart } from 'react-icons/fi';
import { RiGroupLine } from 'react-icons/ri';
import { MdOutlineNotificationImportant } from 'react-icons/md';

export type NotificationType =
  | 'message'
  | 'problem_generation'
  | 'problem_regeneration'
  | 'problem_generation_failed'
  | 'problem_regeneration_failed'
  | 'assignment_submitted'
  | 'assignment_deployed'
  | 'class_join_request'
  | 'class_approved'
  | 'grading_updated'
  | 'market_sale'
  | 'market_new_product'
  // 레거시 타입 (하위 호환성)
  | 'assignment_created'
  | 'assignment_distributed'
  | 'grading_completed'
  | 'class_approval_request'
  | 'class_approval_completed';

interface NotificationTypeMeta {
  label: string;
  icon: React.ReactNode;
  colorClass: 'message' | 'success' | 'info' | 'class' | 'market' | 'error';
}

// CSS 변수를 사용하는 색상 클래스 매핑
export const colorClassMap = {
  message: {
    color: 'var(--notif-message-color)',
    bgColor: 'var(--notif-message-bg)',
  },
  success: {
    color: 'var(--notif-success-color)',
    bgColor: 'var(--notif-success-bg)',
  },
  info: {
    color: 'var(--notif-info-color)',
    bgColor: 'var(--notif-info-bg)',
  },
  class: {
    color: 'var(--notif-class-color)',
    bgColor: 'var(--notif-class-bg)',
  },
  market: {
    color: 'var(--notif-market-color)',
    bgColor: 'var(--notif-market-bg)',
  },
  error: {
    color: 'var(--notif-error-color)',
    bgColor: 'var(--notif-error-bg)',
  },
};

export const notificationTypeMeta: Record<NotificationType, NotificationTypeMeta> = {
  message: {
    label: '쪽지 알림',
    icon: <FiSend size={12} style={{ transform: 'translate(-1px, 1px)' }} />,
    colorClass: 'message',
  },
  problem_generation: {
    label: '문제 생성 완료',
    icon: <FiCheck size={12} />,
    colorClass: 'success',
  },
  problem_regeneration: {
    label: '문제 재생성 완료',
    icon: <FiCheck size={12} />,
    colorClass: 'success',
  },
  problem_generation_failed: {
    label: '문제 생성 실패',
    icon: <MdOutlineNotificationImportant size={12} />,
    colorClass: 'error',
  },
  problem_regeneration_failed: {
    label: '문제 재생성 실패',
    icon: <MdOutlineNotificationImportant size={12} />,
    colorClass: 'error',
  },
  assignment_submitted: {
    label: '과제 제출 알림',
    icon: <FiBookOpen size={12} />,
    colorClass: 'info',
  },
  assignment_deployed: {
    label: '과제 배포 알림',
    icon: <FiBookOpen size={12} />,
    colorClass: 'info',
  },
  class_join_request: {
    label: '클래스 가입 요청',
    icon: <RiGroupLine size={12} />,
    colorClass: 'class',
  },
  class_approved: {
    label: '클래스 승인 완료',
    icon: <RiGroupLine size={12} />,
    colorClass: 'class',
  },
  grading_updated: {
    label: '채점 수정 알림',
    icon: <FiCheck size={12} />,
    colorClass: 'success',
  },
  market_sale: {
    label: '마켓 판매 알림',
    icon: <FiShoppingCart size={12} />,
    colorClass: 'market',
  },
  market_new_product: {
    label: '마켓 신상품 알림',
    icon: <FiShoppingCart size={12} />,
    colorClass: 'market',
  },
  // 레거시 타입 (하위 호환성)
  assignment_created: {
    label: '과제 생성 완료',
    icon: <FiCheck size={12} />,
    colorClass: 'success',
  },
  assignment_distributed: {
    label: '과제 배포 알림',
    icon: <FiBookOpen size={12} />,
    colorClass: 'info',
  },
  grading_completed: {
    label: '채점 완료 알림',
    icon: <FiCheck size={12} />,
    colorClass: 'success',
  },
  class_approval_request: {
    label: '클래스 승인 신청',
    icon: <RiGroupLine size={12} />,
    colorClass: 'class',
  },
  class_approval_completed: {
    label: '클래스 승인 완료',
    icon: <RiGroupLine size={12} />,
    colorClass: 'class',
  },
};
