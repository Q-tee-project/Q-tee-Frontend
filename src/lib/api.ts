// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// 기본 API 호출 함수
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new ApiError(response.status, `API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // 네트워크 오류 등
    throw new Error(`API 통신 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}

// 수학 서비스 API 함수들
export const mathApi = {
  // 교육과정 구조 조회
  async getCurriculumStructure(schoolLevel?: string) {
    const params = schoolLevel ? `?school_level=${schoolLevel}` : '';
    return apiRequest<{ structure: any }>(`/api/math-generation/curriculum/structure${params}`);
  },

  // 대단원 목록 조회
  async getUnits() {
    return apiRequest<{ units: any[] }>('/api/math-generation/curriculum/units');
  },

  // 소단원 목록 조회 (대단원명으로 필터링)
  async getChaptersByUnit(unitName: string) {
    return apiRequest<{ chapters: any[] }>(
      `/api/math-generation/curriculum/chapters?unit_name=${encodeURIComponent(unitName)}`,
    );
  },

  // 문제 생성
  async generateProblems(requestData: any) {
    return apiRequest<{ task_id: string; status: string; message: string }>(
      '/api/math-generation/generate',
      {
        method: 'POST',
        body: JSON.stringify(requestData),
      },
    );
  },

  // 태스크 상태 조회
  async getTaskStatus(taskId: string) {
    return apiRequest<any>(`/api/math-generation/tasks/${taskId}`);
  },

  // 워크시트 목록 조회
  async getWorksheets(skip = 0, limit = 20) {
    return apiRequest<{ worksheets: any[]; total: number }>(
      `/api/math-generation/worksheets?skip=${skip}&limit=${limit}`,
    );
  },

  // 워크시트 상세 조회
  async getWorksheetDetail(worksheetId: number) {
    return apiRequest<any>(`/api/math-generation/worksheets/${worksheetId}`);
  },
};

export { apiRequest, ApiError, API_BASE_URL };
