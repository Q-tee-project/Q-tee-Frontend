import { apiRequest, API_BASE_URL } from '@/lib/api';
import { Categories, QuestionFormData, QuestionGenerationResponse, Question } from '@/types/api';

const MATH_API_BASE = 'http://localhost:8001';

export class MathService {
  // 수학 문제 생성
  static async generateMathProblems(
    formData: QuestionFormData,
  ): Promise<QuestionGenerationResponse> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${MATH_API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Math API Error: ${response.status}`);
    }

    return response.json();
  }

  // 수학 워크시트 목록 조회
  static async getMathWorksheets(): Promise<any[]> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${MATH_API_BASE}/worksheets?limit=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Math API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.worksheets || [];
  }

  // 워크시트 상세 조회
  static async getWorksheetDetail(worksheetId: number): Promise<any> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${MATH_API_BASE}/worksheets/${worksheetId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Math API Error: ${response.status}`);
    }

    return response.json();
  }

  // 워크시트 저장 (기존 코드 유지)
  static async saveWorksheet(
    worksheetId: number,
    questions: Question[],
    title: string,
    config: any,
  ): Promise<any> {
    return apiRequest('/api/worksheets/save', {
      method: 'POST',
      body: JSON.stringify({
        worksheetId,
        questions,
        title,
        config,
      }),
    });
  }

  // 워크시트 삭제
  static async deleteWorksheet(worksheetId: number): Promise<void> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${MATH_API_BASE}/worksheets/${worksheetId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Math API Error: ${response.status}`);
    }
  }

  // === Aliases for backwards compatibility with hooks/components ===
  static async getMathWorksheetDetail(worksheetId: number): Promise<any> {
    return this.getWorksheetDetail(worksheetId);
  }

  static async deleteMathWorksheet(worksheetId: number): Promise<void> {
    return this.deleteWorksheet(worksheetId);
  }

  // 문제 업데이트
  static async updateProblem(problemId: number, updatedData: Partial<Question>): Promise<Question> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${MATH_API_BASE}/problems/${problemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error(`Math API Error: ${response.status}`);
    }

    return response.json();
  }

  // 워크시트 업데이트
  static async updateWorksheet(worksheetId: number, updatedData: any): Promise<any> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${MATH_API_BASE}/worksheets/${worksheetId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error(`Math API Error: ${response.status}`);
    }

    return response.json();
  }

  // Alias for hooks/components expecting this name
  static async updateMathWorksheet(worksheetId: number, updatedData: any): Promise<any> {
    return this.updateWorksheet(worksheetId, updatedData);
  }

  // 문제 재생성
  static async regenerateProblem(
    problemId: number,
    updatedData: Partial<Question>,
  ): Promise<Question> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${MATH_API_BASE}/problems/${problemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error(`Math API Error: ${response.status}`);
    }

    return response.json();
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

    const response = await fetch(`${MATH_API_BASE}/problems/regenerate-async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(regenerateData),
    });

    if (!response.ok) {
      throw new Error(`Math API Error: ${response.status}`);
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

    const response = await fetch(`${MATH_API_BASE}/tasks/${taskId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Math API Error: ${response.status}`);
    }

    return response.json();
  }
}
