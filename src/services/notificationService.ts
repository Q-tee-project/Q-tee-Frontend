'use client';

export interface NotificationData {
  message_id: number;
  sender_id: number;
  sender_name: string;
  sender_type: 'teacher' | 'student';
  subject: string;
  preview: string;
  classroom_id?: number;
}

export interface SSENotification {
  type: 'message';
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

    // TODO: Notification service is not implemented yet
    // Temporarily disable SSE connection to prevent errors
    console.log('SSE 연결 비활성화됨 - 알림 서비스가 구현되지 않음');
    console.log(`SSE 연결 시도 (비활성화됨): ${this.baseUrl}/api/notifications/stream/${userType}/${userId}`);
    
    // Uncomment the following code when notification service is implemented:
    /*
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
    */
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

  isConnected(): boolean {
    // TODO: Return false until notification service is implemented
    return false;
    // return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }
}

export const notificationService = new NotificationService();