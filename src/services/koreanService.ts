import {
  KoreanFormData,
  KoreanGenerationResponse,
  KoreanWorksheet,
  KoreanProblem,
} from '@/types/korean';

const KOREAN_API_BASE = 'http://localhost:8004/api/korean-generation';

export class KoreanService {
  // 국어 문제 생성
  static async generateKoreanProblems(formData: KoreanFormData): Promise<KoreanGenerationResponse> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${KOREAN_API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Korean API Error: ${response.status}`);
    }

    return response.json();
  }

  // 국어 워크시트 목록 가져오기
  static async getKoreanWorksheets(): Promise<KoreanWorksheet[]> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${KOREAN_API_BASE}/worksheets?limit=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Korean API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.worksheets || [];
  }

  // 국어 워크시트 상세 정보 가져오기
  static async getKoreanWorksheetDetail(
    worksheetId: number,
  ): Promise<{ worksheet: KoreanWorksheet; problems: KoreanProblem[] }> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${KOREAN_API_BASE}/worksheets/${worksheetId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Korean API Error: ${response.status}`);
    }

    return response.json();
  }

  // 국어 워크시트 삭제
  static async deleteKoreanWorksheet(worksheetId: number): Promise<void> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${KOREAN_API_BASE}/worksheets/${worksheetId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Korean API Error: ${response.status}`);
    }
  }

  // 국어 태스크 상태 확인
  static async getKoreanTaskStatus(taskId: string): Promise<any> {
    const response = await fetch(`${KOREAN_API_BASE}/tasks/${taskId}`);

    if (!response.ok) {
      throw new Error(`Korean API Error: ${response.status}`);
    }

    return response.json();
  }

  // 국어 워크시트 업데이트
  static async updateKoreanWorksheet(
    worksheetId: number,
    updateData: any,
  ): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${KOREAN_API_BASE}/worksheets/${worksheetId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      let errorMessage = `Korean API Error: ${response.status}`;
      try {
        const errorData = await response.text();
        errorMessage += ` - ${errorData}`;
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return { success: true, message: result.message || '국어 워크시트가 업데이트되었습니다.' };
  }

  // 국어 서비스 헬스체크
  static async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch('http://localhost:8004/');

      if (!response.ok) {
        throw new Error(`Korean Service Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: 'healthy',
        message: data.message,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Korean service connection failed',
      };
    }
  }

  // 비동기 문제 재생성 (Celery 사용)
  static async regenerateProblemAsync(regenerateData: {
    problem_id: number;
    requirements: string;
    current_problem: any;
  }): Promise<{ task_id: string }> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${KOREAN_API_BASE}/problems/regenerate-async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(regenerateData),
    });

    if (!response.ok) {
      throw new Error(`Korean API Error: ${response.status}`);
    }

    return response.json();
  }

  // Celery 작업 상태 확인
  static async getTaskStatus(taskId: string): Promise<{
    status: string;
    result?: any;
    error?: string;
  }> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${KOREAN_API_BASE}/tasks/${taskId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Korean API Error: ${response.status}`);
    }

    return response.json();
  }
}
