import { tokenStorage } from '@/services/authService';

interface PollTaskOptions {
  taskId: string;
  apiBaseUrl: string;
  taskEndpoint: string;
  onProgress?: (progress: number) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  maxAttempts?: number;
}

interface FetchWorksheetOptions {
  worksheetId: number;
  apiBaseUrl: string;
  worksheetEndpoint: string;
}

// 공통 유저 정보 가져오기
export const getCurrentUserId = (): number => {
  if (typeof window === 'undefined') {
    throw new Error('Window is not defined');
  }
  const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
  const userId = currentUser?.id;

  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  return userId;
};

// 공통 API 요청 헬퍼
export const apiRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = tokenStorage.getToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`API 요청 실패: ${response.status} - ${errorData}`);
  }

  return response.json();
};

// 태스크 상태 폴링
export const pollTaskStatus = async ({
  taskId,
  apiBaseUrl,
  taskEndpoint,
  onProgress,
  onSuccess,
  onError,
  maxAttempts = 600,
}: PollTaskOptions): Promise<void> => {
  let attempts = 0;

  const poll = async () => {
    try {
      const url = `${apiBaseUrl}${taskEndpoint}/${taskId}`;
      const data = await apiRequest(url);

      if (data.status === 'PROGRESS') {
        const progress = Math.round((data.current / data.total) * 100);
        onProgress?.(progress);
      } else if (data.status === 'SUCCESS') {
        onSuccess?.(data.result);
        return;
      } else if (data.status === 'FAILURE') {
        throw new Error(data.error || '작업 실패');
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(poll, 1000);
      } else {
        throw new Error('작업 시간 초과');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류';
      onError?.(errorMsg);
    }
  };

  await poll();
};

// 워크시트 결과 조회
export const fetchWorksheet = async <T = any>({
  worksheetId,
  apiBaseUrl,
  worksheetEndpoint,
}: FetchWorksheetOptions): Promise<T> => {
  const userId = getCurrentUserId();
  const url = `${apiBaseUrl}${worksheetEndpoint}/${worksheetId}?user_id=${userId}`;
  return apiRequest<T>(url);
};
