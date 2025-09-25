import { authApiRequest } from '@/lib/api';

export interface MessageRecipient {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: 'teacher' | 'student';
  school_level?: 'middle' | 'high';
  grade?: number;
}

export interface MessageResponse {
  id: number;
  subject: string;
  content: string;
  sender: MessageRecipient;
  recipient: MessageRecipient;
  is_read: boolean;
  is_starred: boolean;
  sent_at: string;
  read_at?: string;
}

export interface MessageListResponse {
  messages: MessageResponse[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface MessageSendRequest {
  subject: string;
  content: string;
  recipient_ids: number[];
}

class MessageService {
  async getMessageRecipients(): Promise<MessageRecipient[]> {
    return authApiRequest<MessageRecipient[]>('/api/messages/recipients');
  }

  async sendMessage(messageData: MessageSendRequest): Promise<any> {
    return authApiRequest<any>('/api/messages/', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getMessages(
    page: number = 1,
    pageSize: number = 15,
    filterType: string = 'all',
    searchQuery: string = '',
    searchType: string = 'subject'
  ): Promise<MessageListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      filter_type: filterType,
      search_query: searchQuery,
      search_type: searchType,
    });

    return authApiRequest<MessageListResponse>(`/api/messages/?${params}`);
  }

  async getMessageDetail(messageId: number): Promise<MessageResponse> {
    return authApiRequest<MessageResponse>(`/api/messages/${messageId}`);
  }

  async markAsRead(messageId: number): Promise<any> {
    return authApiRequest<any>(`/api/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  async toggleStar(messageId: number, isStarred: boolean): Promise<any> {
    return authApiRequest<any>(`/api/messages/${messageId}/star`, {
      method: 'PUT',
      body: JSON.stringify({ is_starred: isStarred }),
    });
  }

  async deleteMessage(messageId: number): Promise<any> {
    return authApiRequest<any>(`/api/messages/${messageId}`, {
      method: 'DELETE',
    });
  }
}

export const messageService = new MessageService();