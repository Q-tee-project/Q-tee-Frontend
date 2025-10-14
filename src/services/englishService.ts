import {
  EnglishWorksheetGeneratorFormData,
  EnglishGenerationResponse,
  EnglishWorksheetData,
  EnglishWorksheetDetailResponse,
  EnglishQuestion,
  EnglishRegenerationInfo,
  EnglishRegenerationRequest,
  EnglishRegenerationResponse,
  EnglishDataRegenerationRequest,
  EnglishAsyncResponse,
  EnglishTaskStatus,
  EnglishRegenerationAsyncResponse,
  EnglishRegenerationTaskStatus,
  StudentAssignmentResponse,
} from '@/types/english';

// Helper function to get auth token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

// 타입 별칭 생성 (기존 코드 호환성)
type EnglishFormData = EnglishWorksheetGeneratorFormData;
type EnglishWorksheet = EnglishWorksheetData;
type EnglishProblem = EnglishQuestion;
type EnglishWorksheetDetail = EnglishWorksheetData;
type EnglishLLMResponseAndRequest = EnglishWorksheetData;

// 영어 과제 배포 요청 (백엔드 API와 일치)
export interface EnglishAssignmentDeployRequest {
  assignment_id: number; // 영어 워크시트 ID (백엔드에서는 assignment_id로 요구)
  classroom_id: number; // 클래스룸 ID
  student_ids: number[]; // 학생 ID 목록
}

const ENGLISH_API_BASE = 'http://localhost:8002/api/english';

// Helper function for API requests
const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication token not found. Please log in.');
  }

  const response = await fetch(`${ENGLISH_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed: ${response.status}`);
  }

  return response.json();
};

// 영어 결과 관련 타입
export interface EnglishAssignmentResult {
  id: number;
  result_id: string;
  worksheet_id: number;
  student_name: string;
  student_id?: number;
  completion_time: number;
  total_score: number;
  max_score: number;
  percentage: number;
  needs_review: boolean;
  is_reviewed: boolean;
  created_at: string;
  worksheet_name?: string;
}

export class EnglishService {
  // 영어 문제 생성 (비동기 처리로 변경)
  static async generateEnglishProblems(formData: EnglishFormData): Promise<EnglishAsyncResponse> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    return apiRequest<EnglishAsyncResponse>(`/worksheet-generate?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  // 영어 워크시트 목록 가져오기
  static async getEnglishWorksheets(): Promise<EnglishWorksheet[]> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const token = getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const data = await apiRequest<EnglishWorksheet[]>(`/worksheets?user_id=${userId}&limit=1000`);
    return data || [];
  }

  // 영어 워크시트 상세 정보 가져오기
  static async getEnglishWorksheetDetail(worksheetId: number): Promise<EnglishWorksheetDetailResponse> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    return apiRequest<EnglishWorksheetDetailResponse>(`/worksheets/${worksheetId}?user_id=${userId}`);
  }

  // 영어 태스크 상태 확인 (개선)
  static async getTaskStatus(taskId: string): Promise<EnglishTaskStatus> {
    return apiRequest<EnglishTaskStatus>(`/task-status/${taskId}`);
  }

  // 영어 워크시트 업데이트
  static async updateEnglishWorksheet(
    worksheetId: number,
    updateData: any,
  ): Promise<{ success: boolean; message: string }> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const token = getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const result = await apiRequest(`/worksheets/${worksheetId}?user_id=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    return { success: true, message: result.message || '영어 워크시트가 업데이트되었습니다.' };
  }

  // 영어 워크시트 저장
  static async saveEnglishWorksheet(
    worksheetData: EnglishWorksheetData,
  ): Promise<{ worksheet_id: number; message: string }> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const token = getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const result = await apiRequest<{ worksheet_id: number; message: string }>(`/worksheet-save`, {
      method: 'POST',
      body: JSON.stringify(worksheetData),
    });

    return {
      worksheet_id: result.worksheet_id || worksheetData.worksheet_id || 0,
      message: result.message || '영어 워크시트가 저장되었습니다.',
    };
  }

  // 영어 문제 수정
  static async updateEnglishQuestion(
    worksheetId: number,
    questionId: number,
    updateData: any,
  ): Promise<{ success: boolean; message: string }> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const result = await apiRequest(
      `/worksheets/${worksheetId}/questions/${questionId}?user_id=${userId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }
    );

    return { success: true, message: result.message || '영어 문제가 업데이트되었습니다.' };
  }

  // 영어 지문 수정
  static async updateEnglishPassage(
    worksheetId: number,
    passageId: number,
    updateData: any,
  ): Promise<{ success: boolean; message: string }> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const result = await apiRequest(
      `/worksheets/${worksheetId}/passages/${passageId}?user_id=${userId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }
    );

    return { success: true, message: result.message || '영어 지문이 업데이트되었습니다.' };
  }

  // 영어 워크시트 제목 수정
  static async updateEnglishWorksheetTitle(
    worksheetId: number,
    newTitle: string,
  ): Promise<{ success: boolean; message: string }> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const token = getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const result = await apiRequest(`/worksheets/${worksheetId}/title?user_id=${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ worksheet_name: newTitle }),
    });

    return { success: true, message: result.message || '영어 워크시트 제목이 업데이트되었습니다.' };
  }

  // 영어 워크시트 일괄 삭제
  static async batchDeleteEnglishWorksheets(
    worksheetIds: number[],
  ): Promise<{ success: boolean; message: string; deleted_count: number }> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    if (!worksheetIds || worksheetIds.length === 0) {
      throw new Error('삭제할 워크시트 ID가 필요합니다.');
    }

    const result = await apiRequest(`/worksheets/batch?user_id=${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ worksheet_ids: worksheetIds }),
    });

    return {
      success: true,
      message: result.message || `${worksheetIds.length}개의 워크시트가 삭제되었습니다.`,
      deleted_count: result.deleted_count || worksheetIds.length,
    };
  }

  // 영어 문제 재생성 정보 조회
  static async getEnglishQuestionRegenerationInfo(
    worksheetId: number,
    questionId: number,
  ): Promise<EnglishRegenerationInfo> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const token = getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    return apiRequest<EnglishRegenerationInfo>(
      `/worksheets/${worksheetId}/questions/${questionId}/regeneration-info?user_id=${userId}`
    );
  }

  // 영어 문제 재생성 실행
  static async regenerateEnglishQuestion(
    worksheetId: number,
    questionId: number,
    regenerationData: EnglishRegenerationRequest,
  ): Promise<EnglishRegenerationResponse> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const result = await apiRequest<EnglishRegenerationResponse>(
      `/worksheets/${worksheetId}/questions/${questionId}/regenerate?user_id=${userId}`,
      {
        method: 'POST',
        body: JSON.stringify(regenerationData),
      }
    );

    console.log('영어 문제 재생성 응답 (ID 기반):', result);
    return result;
  }

  // 영어 문제 재생성 (데이터 기반) - v2.0 API (비동기)
  static async regenerateEnglishQuestionFromData(
    questionsData: EnglishQuestion[],
    passageData: any | null,
    regenerationRequest: EnglishRegenerationRequest,
  ): Promise<EnglishRegenerationAsyncResponse> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const token = getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const requestBody = {
      questions: questionsData,
      passage: passageData,
      formData: regenerationRequest,
    };

    const result = await apiRequest<EnglishRegenerationAsyncResponse>(
      `/questions/regenerate?user_id=${userId}`,
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    );

    console.log('✅ 영어 지문/문제 재생성 비동기 시작:', result);
    return result;
  }

  // 영어 재생성 태스크 상태 조회
  static async getRegenerationTaskStatus(taskId: string): Promise<EnglishRegenerationTaskStatus> {
    return apiRequest<EnglishRegenerationTaskStatus>(`/task-status/${taskId}`);
  }

  // 영어 서비스 헬스체크 (public endpoint - 토큰 선택적)
  static async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:8002/', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

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

  static async deployAssignment(deployRequest: EnglishAssignmentDeployRequest): Promise<any> {
    console.log('📤 영어 과제 배포 요청:', deployRequest);

    const result = await apiRequest(`/assignments/deploy`, {
      method: 'POST',
      body: JSON.stringify(deployRequest),
    });

    console.log('📤 성공 응답:', result);
    return result;
  }

  // 영어 과제 생성 (배포하지 않고 생성만)
  static async createAssignment(worksheetId: number, classroomId: number): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const result = await apiRequest(`/assignments/create`, {
      method: 'POST',
      body: JSON.stringify({
        worksheet_id: worksheetId,
        classroom_id: classroomId,
      }),
    });

    console.log('📝 과제 생성 성공 응답:', result);
    return result;
  }

  // 영어 배포된 과제 목록 조회
  static async getDeployedAssignments(classId: string): Promise<any[]> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const token = getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const data = await apiRequest<any[]>(`/assignments/classrooms/${classId}/assignments`);
    return Array.isArray(data) ? data : [];
  }

  // 영어 과제 상세 정보 조회 (학생용)
  static async getAssignmentDetail(assignmentId: number, studentId: number): Promise<any> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const token = getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    return apiRequest(`/assignments/${assignmentId}/student/${studentId}?user_id=${userId}`);
  }

  // 영어 학생 과제 목록 조회
  static async getStudentAssignments(studentId: number): Promise<StudentAssignmentResponse[]> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const token = getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const data = await apiRequest<any[]>(`/assignments/student/${studentId}?user_id=${userId}`);
    return data || [];
  }

  // 영어 과제 제출
  static async submitTest(
    assignmentId: number,
    studentId: number,
    answers: Record<number, string>,
  ): Promise<any> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const token = getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const submissionData = {
      assignment_id: assignmentId,
      student_id: studentId,
      answers: answers,
      user_id: userId,
    };

    console.log('📤 영어 과제 제출 데이터:', submissionData);

    const result = await apiRequest(`/assignments/submit`, {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });

    console.log('📤 영어 과제 제출 성공:', result);
    return result;
  }

  // 영어 과제 결과 조회
  static async getEnglishAssignmentResults(assignmentId: number): Promise<any> {
    try {
      const data = await apiRequest(`/assignments/${assignmentId}/results`);
      return data.results || [];
    } catch (error) {
      throw error;
    }
  }

  // 영어 assignment 결과 상세 조회
  static async getEnglishAssignmentResultDetail(resultId: string): Promise<any> {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Direct backend call (like Korean service)
      const response = await fetch(`${ENGLISH_API_BASE}/grading-results/${resultId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`English API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // 영어 채점 결과 승인/리뷰
  static async approveEnglishGrade(resultId: string, reviewData?: any): Promise<any> {
    try {
      return await apiRequest(`/grading-results/${resultId}/review`, {
        method: 'PUT',
        body: JSON.stringify(reviewData || { is_reviewed: true }),
      });
    } catch (error) {
      throw error;
    }
  }

  // 영어 AI 채점 시작 (워크시트 기반)
  static async startEnglishAIGrading(worksheetId: number): Promise<any> {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const userId = currentUser?.id;

      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // 영어 백엔드에서 지원하는 실제 엔드포인트 사용
      const response = await fetch(`${ENGLISH_API_BASE}/worksheets/${worksheetId}/start-grading`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        // 대안 엔드포인트 시도
        const altResponse = await fetch(`${ENGLISH_API_BASE}/grading/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ worksheet_id: worksheetId, user_id: userId }),
        });

        if (!altResponse.ok) {
          throw new Error(`English API Error: ${response.status}`);
        }

        return await altResponse.json();
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // 영어 AI 채점 상태 확인
  static async getEnglishGradingTaskStatus(taskId: string): Promise<any> {
    try {
      return await apiRequest(`/grading/tasks/${taskId}/status`);
    } catch (error) {
      throw error;
    }
  }

  // 영어 채점 세션 업데이트
  static async updateEnglishGradingSession(resultId: string, gradingData: any): Promise<any> {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Direct backend call (like Korean service)
      const response = await fetch(`${ENGLISH_API_BASE}/grading-results/${resultId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gradingData),
      });

      if (!response.ok) {
        throw new Error(`English API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async deleteAssignment(assignmentId: number): Promise<{ message: string }> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`http://localhost:8002/api/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete assignment: ${response.status}`);
    }

    return response.json();
  }
}
