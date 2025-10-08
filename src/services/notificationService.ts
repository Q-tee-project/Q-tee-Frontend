'use client';

// 알림 타입 정의
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
  | 'market_new_product';

// 각 알림 타입별 데이터 인터페이스
export interface MessageNotificationData {
  message_id: number;
  sender_id: number;
  sender_name: string;
  sender_type: 'teacher' | 'student';
  subject: string;
  preview: string;
  classroom_id?: number;
}

export interface ProblemGenerationData {
  task_id: string;
  subject: 'math' | 'korean' | 'english';
  worksheet_id: number;
  worksheet_title: string;
  problem_count: number;
  success: boolean;
  error_message?: string;
}

export interface ProblemRegenerationData {
  task_id: string;
  subject: 'math' | 'korean' | 'english';
  worksheet_id: number;
  worksheet_title: string;
  problem_number: number;
  success: boolean;
  error_message?: string;
}

export interface AssignmentSubmittedData {
  assignment_id: number;
  assignment_title: string;
  student_id: number;
  student_name: string;
  class_id: number;
  class_name: string;
  submitted_at: string;
}

export interface AssignmentDeployedData {
  assignment_id: number;
  assignment_title: string;
  class_id: number;
  class_name: string;
  due_date?: string;
}

export interface ClassJoinRequestData {
  student_id: number;
  student_name: string;
  class_id: number;
  class_name: string;
  message?: string;
}

export interface ClassApprovedData {
  class_id: number;
  class_name: string;
  teacher_name: string;
}

export interface GradingUpdatedData {
  assignment_id: number;
  assignment_title: string;
  score: number;
  feedback?: string;
}

export interface MarketSaleData {
  product_id: number;
  product_title: string;
  buyer_id: number;
  buyer_name: string;
  amount: number;
}

export interface MarketNewProductData {
  product_id: number;
  product_title: string;
  seller_name: string;
}

// Union type for all notification data
export type NotificationData =
  | MessageNotificationData
  | ProblemGenerationData
  | ProblemRegenerationData
  | AssignmentSubmittedData
  | AssignmentDeployedData
  | ClassJoinRequestData
  | ClassApprovedData
  | GradingUpdatedData
  | MarketSaleData
  | MarketNewProductData;

export interface SSENotification {
  type: NotificationType;
  id: string;
  data: NotificationData;
  timestamp: string;
  read: boolean;
}

export interface StoredNotificationResponse {
  notifications: SSENotification[];
}

class NotificationService {
  private eventSource: EventSource | null = null;
  private listeners: ((notification: SSENotification) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private baseUrl = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost:8006';

  connect(userType: 'teacher' | 'student', userId: number): void {
    if (this.eventSource) {
      this.disconnect();
    }

    // Uncomment the following code when notification service is implemented:
    
    const url = `${this.baseUrl}/api/notifications/stream/${userType}/${userId}`;
    console.log('SSE 연결 시도:', url);

    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log('SSE 연결 성공');
      this.reconnectAttempts = 0;
    };

    this.eventSource.onmessage = (event) => {
      try {
        const notification: SSENotification = JSON.parse(event.data);
        console.log('새 알림 수신:', notification);
        this.notifyListeners(notification);
      } catch (error) {
        console.error('알림 파싱 에러:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE 연결 에러:', error);
      this.handleReconnect(userType, userId);
    };
    
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('SSE 연결 해제');
    }
    this.reconnectAttempts = 0;
  }

  private handleReconnect(userType: 'teacher' | 'student', userId: number): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect(userType, userId);
      }, delay);
    } else {
      console.error('최대 재연결 시도 횟수 초과');
    }
  }

  addListener(callback: (notification: SSENotification) => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (notification: SSENotification) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(notification: SSENotification): void {
    this.listeners.forEach(listener => listener(notification));
  }

  async getStoredNotifications(
    userType: 'teacher' | 'student',
    userId: number,
    limit: number = 10
  ): Promise<SSENotification[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/stored/${userType}/${userId}?limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StoredNotificationResponse = await response.json();
      return data.notifications;
    } catch (error) {
      console.error('저장된 알림 조회 실패:', error);
      return [];
    }
  }

  async clearStoredNotifications(userType: 'teacher' | 'student', userId: number): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/stored/${userType}/${userId}`,
        { method: 'DELETE' }
      );

      return response.ok;
    } catch (error) {
      console.error('저장된 알림 삭제 실패:', error);
      return false;
    }
  }

  async markAsRead(userType: 'teacher' | 'student', userId: number, notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/stored/${userType}/${userId}/${notificationId}/read`,
        { method: 'PATCH' }
      );
      return response.ok;
    } catch (error) {
      console.error(`Failed to mark notification ${notificationId} as read:`, error);
      return false;
    }
  }

  async markAllAsRead(userType: 'teacher' | 'student', userId: number): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/stored/${userType}/${userId}/read-all`,
        { method: 'PATCH' }
      );
      return response.ok;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  }

  async deleteNotificationsByType(userType: 'teacher' | 'student', userId: number, notificationType: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/stored/${userType}/${userId}/type/${notificationType}`,
        { method: 'DELETE' }
      );
      return response.ok;
    } catch (error) {
      console.error(`Failed to delete ${notificationType} notifications:`, error);
      return false;
    }
  }

  async deleteNotification(userType: 'teacher' | 'student', userId: number, notificationType: string, notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/stored/${userType}/${userId}/${notificationType}/${notificationId}`,
        { method: 'DELETE' }
      );
      return response.ok;
    } catch (error) {
      console.error(`Failed to delete notification ${notificationId}:`, error);
      return false;
    }
  }

  async sendTestNotification(userType: 'teacher' | 'student', userId: number): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/test/${userType}/${userId}`
      );

      return response.ok;
    } catch (error) {
      console.error('테스트 알림 전송 실패:', error);
      return false;
    }
  }

  async sendProblemGenerationNotification(
    data: ProblemGenerationData & { receiver_id: number; receiver_type: 'teacher' | 'student' }
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/problem/generation`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );
      return response.ok;
    } catch (error) {
      console.error('문제 생성 알림 전송 실패:', error);
      return false;
    }
  }

  async sendProblemRegenerationNotification(
    data: ProblemRegenerationData & { receiver_id: number; receiver_type: 'teacher' | 'student' }
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/problem/regeneration`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );
      return response.ok;
    } catch (error) {
      console.error('문제 재생성 알림 전송 실패:', error);
      return false;
    }
  }

  async sendAssignmentSubmittedNotification(
    data: AssignmentSubmittedData & { receiver_id: number; receiver_type: 'teacher' }
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/assignment/submitted`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );
      return response.ok;
    } catch (error) {
      console.error('과제 제출 알림 전송 실패:', error);
      return false;
    }
  }

  async sendAssignmentDeployedNotification(
    data: AssignmentDeployedData & { receiver_id: number; receiver_type: 'student' }
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/assignment/deployed`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );
      return response.ok;
    } catch (error) {
      console.error('과제 배포 알림 전송 실패:', error);
      return false;
    }
  }

  async sendClassJoinRequestNotification(
    data: ClassJoinRequestData & { receiver_id: number; receiver_type: 'teacher' }
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/class/join-request`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );
      return response.ok;
    } catch (error) {
      console.error('클래스 가입 요청 알림 전송 실패:', error);
      return false;
    }
  }

  async sendClassApprovedNotification(
    data: ClassApprovedData & { receiver_id: number; receiver_type: 'student' }
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/class/approved`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );
      return response.ok;
    } catch (error) {
      console.error('클래스 승인 알림 전송 실패:', error);
      return false;
    }
  }

  async sendGradingUpdatedNotification(
    data: GradingUpdatedData & { receiver_id: number; receiver_type: 'student' }
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/grading/updated`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );
      return response.ok;
    } catch (error) {
      console.error('채점 수정 알림 전송 실패:', error);
      return false;
    }
  }

  async sendMarketSaleNotification(
    data: MarketSaleData & { receiver_id: number; receiver_type: 'teacher' | 'student' }
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/market/sale`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );
      return response.ok;
    } catch (error) {
      console.error('마켓 판매 알림 전송 실패:', error);
      return false;
    }
  }

  async sendMarketNewProductNotification(
    data: MarketNewProductData & { receiver_id: number; receiver_type: 'teacher' | 'student' }
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/notifications/market/new-product`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );
      return response.ok;
    } catch (error) {
      console.error('마켓 신상품 알림 전송 실패:', error);
      return false;
    }
  }

  isConnected(): boolean {
    // TODO: Return false until notification service is implemented
    return false;
    // return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }
}

export const notificationService = new NotificationService();