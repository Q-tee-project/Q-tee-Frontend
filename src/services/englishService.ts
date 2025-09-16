
const ENGLISH_API_BASE = 'http://localhost:8002/api/english-generation';

export interface EnglishFormData {
  school_level: string;
  grade: number;
  semester: string;
  english_type: string;
  english_sub_type?: string;
  english_ratios?: Record<string, number>;
  difficulty: string;
  difficulty_ratios?: Record<string, number>;
  requirements?: string;
  problem_count: number;
}

export interface EnglishGenerationResponse {
  task_id: string;
  status: string;
  message: string;
}

export interface EnglishWorksheet {
  id: number;
  title: string;
  school_level: string;
  grade: number;
  english_type: string;
  problem_count: number;
  status: string;
  created_at: string;
}

export interface EnglishProblem {
  id: number;
  worksheet_id: number;
  problem_number: number;
  problem_type: string;
  content: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  difficulty: string;
}

export class EnglishService {
  // 영어 문제 생성
  static async generateEnglishProblems(formData: EnglishFormData): Promise<EnglishGenerationResponse> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${ENGLISH_API_BASE}/generate?user_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`English API Error: ${response.status}`);
    }

    return response.json();
  }

  // 영어 워크시트 목록 가져오기
  static async getEnglishWorksheets(): Promise<EnglishWorksheet[]> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${ENGLISH_API_BASE}/worksheets?user_id=${userId}`);

    if (!response.ok) {
      throw new Error(`English API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.worksheets || [];
  }

  // 영어 워크시트 상세 정보 가져오기
  static async getEnglishWorksheetDetail(worksheetId: number): Promise<{ worksheet: EnglishWorksheet; problems: EnglishProblem[] }> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${ENGLISH_API_BASE}/worksheets/${worksheetId}?user_id=${userId}`);

    if (!response.ok) {
      throw new Error(`English API Error: ${response.status}`);
    }

    return response.json();
  }

  // 영어 태스크 상태 확인
  static async getEnglishTaskStatus(taskId: string): Promise<any> {
    const response = await fetch(`${ENGLISH_API_BASE}/tasks/${taskId}`);

    if (!response.ok) {
      throw new Error(`English API Error: ${response.status}`);
    }

    return response.json();
  }

  // 영어 서비스 헬스체크
  static async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch('http://localhost:8002/');

      if (!response.ok) {
        throw new Error(`English Service Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: 'healthy',
        message: data.message,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'English service connection failed',
      };
    }
  }
}