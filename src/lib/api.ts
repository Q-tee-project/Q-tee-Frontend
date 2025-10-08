// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001';
const ENGLISH_API_BASE_URL =
  process.env.NEXT_PUBLIC_ENGLISH_API_BASE_URL || 'http://localhost:8002';
const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || 'http://localhost:8003';
const KOREAN_API_BASE_URL = process.env.NEXT_PUBLIC_KOREAN_API_BASE_URL || 'http://localhost:8004';
const MARKET_API_BASE_URL = process.env.NEXT_PUBLIC_MARKET_API_BASE_URL || 'http://localhost:8005';
const NOTIFICATION_API_BASE_URL =
  process.env.NEXT_PUBLIC_NOTIFICATION_API_BASE_URL || 'http://localhost:8006';

// 토큰 만료 처리를 위한 callback
let onTokenExpired: (() => void) | null = null;

export const setTokenExpiredCallback = (callback: () => void) => {
  onTokenExpired = callback;
};

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// 기본 API 호출 함수
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  baseUrl: string = API_BASE_URL,
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401 && onTokenExpired) {
        onTokenExpired();
      }

      let errorMessage = `API 요청 실패: ${response.status}`;
      try {
        const errorBody = await response.text();
        errorMessage += ` - ${errorBody}`;
      } catch (e) {
        // Error reading response body
      }
      throw new ApiError(response.status, errorMessage);
    }

    if (response.status === 204) {
      return {} as T; // 204 No Content의 경우, 빈 객체를 반환
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`API 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요. (${url})`);
    }

    throw new Error(`API 통신 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

// 인증 API 호출 함수
async function authApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Dynamic import to avoid circular dependency
  const { tokenStorage } = await import('@/services/authService');
  const token = tokenStorage.getToken();

  const authOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  };

  return apiRequest<T>(endpoint, authOptions, AUTH_API_BASE_URL);
}

// 수학 서비스 API 함수들
export const mathApi = {
  // 교육과정 구조 조회
  async getCurriculumStructure(schoolLevel?: string) {
    const params = schoolLevel ? `?school_level=${schoolLevel}` : '';
    return apiRequest<{ structure: any }>(`/curriculum/structure${params}`);
  },

  // 대단원 목록 조회
  async getUnits() {
    return apiRequest<{ units: any[] }>('/curriculum/units');
  },

  // 소단원 목록 조회 (대단원명으로 필터링)
  async getChaptersByUnit(unitName: string) {
    return apiRequest<{ chapters: any[] }>(
      `/curriculum/chapters?unit_name=${encodeURIComponent(unitName)}`,
    );
  },

  // 문제 생성
  async generateProblems(requestData: any) {
    return apiRequest<{ task_id: string; status: string; message: string }>('/generate', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  // 태스크 상태 조회
  async getTaskStatus(taskId: string) {
    return apiRequest<any>(`/tasks/${taskId}`);
  },

  // 워크시트 목록 조회
  async getWorksheets(skip = 0, limit = 20) {
    return apiRequest<{ worksheets: any[]; total: number }>(
      `/worksheets?skip=${skip}&limit=${limit}`,
    );
  },

  // 워크시트 상세 조회
  async getWorksheetDetail(worksheetId: number) {
    return apiRequest<any>(`/worksheets/${worksheetId}`);
  },
};

export {
  apiRequest,
  authApiRequest,
  ApiError,
  API_BASE_URL,
  AUTH_API_BASE_URL,
  ENGLISH_API_BASE_URL,
  KOREAN_API_BASE_URL,
  MARKET_API_BASE_URL,
  NOTIFICATION_API_BASE_URL,
};
