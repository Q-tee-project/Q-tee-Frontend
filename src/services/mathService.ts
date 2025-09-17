import { apiRequest, API_BASE_URL } from '@/lib/api';
import { Categories, QuestionFormData, QuestionGenerationResponse, Question } from '@/types/api';

const MATH_API_BASE = 'http://localhost:8001/api/math-generation';

export class MathService {
  // 수학 문제 생성
  static async generateMathProblems(
    formData: QuestionFormData,
  ): Promise<QuestionGenerationResponse> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${MATH_API_BASE}/generate?user_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Math API Error: ${response.status}`);
    }

    return response.json();
  }

  // 수학 워크시트 목록 가져오기
  static async getMathWorksheets(): Promise<any[]> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${MATH_API_BASE}/worksheets?user_id=${userId}&limit=100`);

    if (!response.ok) {
      throw new Error(`Math API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.worksheets || [];
  }

  // 수학 워크시트 상세 정보 가져오기
  static async getMathWorksheetDetail(worksheetId: number): Promise<any> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${MATH_API_BASE}/worksheets/${worksheetId}?user_id=${userId}`);

    if (!response.ok) {
      throw new Error(`Math API Error: ${response.status}`);
    }

    return response.json();
  }

  // 수학 태스크 상태 확인
  static async getMathTaskStatus(taskId: string): Promise<any> {
    const response = await fetch(`${MATH_API_BASE}/tasks/${taskId}`);

    if (!response.ok) {
      throw new Error(`Math API Error: ${response.status}`);
    }

    return response.json();
  }

  // 카테고리 목록 가져오기
  static async getCategories(): Promise<Categories> {
    return apiRequest<Categories>('/categories');
  }

  // 워크시트 삭제
  static async deleteMathWorksheet(
    worksheetId: number,
  ): Promise<{ success: boolean; message: string }> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${MATH_API_BASE}/worksheets/${worksheetId}?user_id=${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      let errorMessage = `Math API Error: ${response.status}`;
      try {
        const errorData = await response.text();
        errorMessage += ` - ${errorData}`;
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return { success: true, message: result.message };
  }

  // 워크시트 업데이트
  static async updateMathWorksheet(
    worksheetId: number,
    updateData: any,
  ): Promise<{ success: boolean; message: string }> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${MATH_API_BASE}/worksheets/${worksheetId}?user_id=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Math API Error: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, message: result.message || '워크시트가 업데이트되었습니다.' };
  }

  // 개별 문제 업데이트
  static async updateMathProblem(
    problemId: number,
    updateData: any,
  ): Promise<{ success: boolean; message: string }> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${MATH_API_BASE}/problems/${problemId}?user_id=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Math API Error: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, message: result.message || '문제가 업데이트되었습니다.' };
  }

  // 학생용 과제 목록 가져오기
  static async getStudentAssignments(): Promise<any[]> {
    return apiRequest<any[]>('/assignments/student');
  }

  // 과제 상세 정보 가져오기
  static async getAssignmentDetail(assignmentId: number): Promise<any> {
    return apiRequest<any>(`/assignments/${assignmentId}/detail`);
  }

  // 과제 시작
  static async startTest(assignmentId: number): Promise<any> {
    return apiRequest<any>('/test-sessions', {
      method: 'POST',
      body: JSON.stringify({ assignment_id: assignmentId }),
    });
  }

  // 답안 저장
  static async saveAnswer(sessionId: string, problemId: number, answer: string): Promise<any> {
    return apiRequest<any>('/test-answers', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        problem_id: problemId,
        answer: answer,
      }),
    });
  }

  // 과제 제출
  static async submitTest(sessionId: string, answers: Record<number, string>): Promise<any> {
    return apiRequest<any>(`/test-sessions/${sessionId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  // 헬스체크
  static async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch('http://localhost:8001/');

      if (!response.ok) {
        throw new Error(`Math Service Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: 'healthy',
        message: data.message,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Math service connection failed',
      };
    }
  }
}
