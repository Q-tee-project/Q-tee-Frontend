import { Worksheet, MathProblem, StudentAssignmentResponse } from '@/types/math';
import {
  Assignment,
  AssignmentDeployRequest,
  AssignmentDeploymentResponse,
} from '@/services/koreanService';
import { tokenStorage } from './authService';
import { normalizeWorksheetResponse, isDatabaseSchemaError, safeApiResponse } from '@/utils/mathSchemaUtils';

const API_BASE_URL = process.env.NEXT_PUBLIC_MATH_API_URL || 'http://localhost:8001';

type Problem = MathProblem;

// Helper function for API requests
const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = tokenStorage.getToken();
  if (!token) {
    throw new Error('Authentication token not found. Please log in.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // 데이터베이스 스키마 오류에 대한 특별 처리
      if (isDatabaseSchemaError(errorData)) {
        console.warn(`Database schema issue: ${errorData.detail}`);
        console.warn('Returning empty data to prevent app crash');
        
        // 스키마 오류의 경우 빈 배열이나 기본값 반환
        if (endpoint.includes('/worksheets/') && !endpoint.includes('/problems')) {
          return { worksheets: [], total: 0 } as T;
        } else if (endpoint.includes('/worksheets/') && endpoint.includes('/problems')) {
          return { worksheet: null, problems: [] } as T;
        }
        return [] as T;
      }
      
      throw new Error(errorData.detail || `Request failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // 네트워크 오류나 기타 예외 처리
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error:', error);
      throw new Error('네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
    }
    throw error;
  }
};

export const mathService = {
  getMathWorksheets: async (
    skip: number = 0,
    limit: number = 1000,
  ): Promise<{ worksheets: Worksheet[]; total: number }> => {
    const responseData = await apiRequest<any>(`/api/worksheets/?skip=${skip}&limit=${limit}`);

    if (Array.isArray(responseData)) {
      return { worksheets: responseData, total: responseData.length };
    } else if (responseData.worksheets) {
      return responseData;
    }
    return { worksheets: [], total: 0 };
  },

  getMathWorksheetProblems: async (
    worksheetId: number,
  ): Promise<{ worksheet: Worksheet; problems: Problem[] }> => {
    try {
      const result = await apiRequest(`/api/worksheets/${worksheetId}`);
      
      // 유틸리티 함수를 사용하여 응답 데이터 정규화
      const normalizedResult = normalizeWorksheetResponse(result);
      
      return normalizedResult;
    } catch (error) {
      console.error('워크시트 상세 조회 중 오류:', error);
      console.warn('데이터베이스 스키마 오류로 인해 빈 데이터를 반환합니다.');
      
      // 오류 발생 시 빈 데이터 반환 (앱 크래시 방지)
      return {
        worksheet: {} as Worksheet,
        problems: []
      };
    }
  },

  deleteMathWorksheet: async (worksheetId: number): Promise<void> => {
    await apiRequest(`/api/worksheets/${worksheetId}`, { method: 'DELETE' });
  },

  getDeployedAssignments: async (classId: string): Promise<Assignment[]> => {
    return apiRequest(`/api/assignments/classrooms/${classId}/assignments`);
  },

  createAssignment: async (worksheetId: number, classroomId: number): Promise<any> => {
    return apiRequest('/api/assignments/create', {
      method: 'POST',
      body: JSON.stringify({ worksheet_id: worksheetId, classroom_id: classroomId }),
    });
  },

  deployAssignment: async (
    deployRequest: AssignmentDeployRequest,
  ): Promise<AssignmentDeploymentResponse[]> => {
    return apiRequest('/api/assignments/deploy', {
      method: 'POST',
      body: JSON.stringify(deployRequest),
    });
  },

  getStudentAssignments: async (studentId: number): Promise<StudentAssignmentResponse[]> => {
    return apiRequest(`/api/assignments/student/${studentId}`);
  },

  getAssignmentDetail: async (assignmentId: number, studentId: number): Promise<any> => {
    return apiRequest(`/api/assignments/${assignmentId}/details?student_id=${studentId}`);
  },

  submitTest: async (sessionId: string, answers: any): Promise<any> => {
    return apiRequest(`/api/test-sessions/test-sessions/${sessionId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  startTest: async (assignmentId: number, studentId: number): Promise<any> => {
    return apiRequest(`/api/assignments/${assignmentId}/start`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId }),
    });
  },

  saveAnswer: async (sessionId: string, problemId: number, answer: string): Promise<any> => {
    return apiRequest(`/api/test-sessions/${sessionId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ problem_id: problemId, answer }),
    });
  },

  updateMathWorksheet: async (worksheetId: number, data: any): Promise<any> => {
    return apiRequest(`/api/worksheets/${worksheetId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateProblem: async (problemId: number, data: any): Promise<any> => {
    return apiRequest(`/api/problems/${problemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  regenerateProblemAsync: async (data: any): Promise<any> => {
    return apiRequest('/api/problems/regenerate-async', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAssignmentResults: async (assignmentId: number): Promise<any[]> => {
    return apiRequest(`/api/grading/assignments/${assignmentId}/results`);
  },

  getGradingSessionDetails: async (sessionId: number): Promise<any> => {
    return apiRequest(`/api/grading/grading-sessions/${sessionId}`);
  },

  submitAnswerWithOCR: async (
    sessionId: string,
    problemId: number,
    answer: string,
    handwritingImage?: File,
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('problem_id', problemId.toString());
    formData.append('answer', answer);
    if (handwritingImage) {
      formData.append('handwriting_image', handwritingImage);
    }

    return apiRequest(`/api/test-sessions/test-sessions/${sessionId}/answers/ocr`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
  },

  getPendingGradingSessions: async (): Promise<any[]> => {
    return apiRequest('/api/grading/grading-sessions/pending');
  },

  approveGradingSession: async (sessionId: number): Promise<any> => {
    return apiRequest(`/api/grading/grading-sessions/${sessionId}/approve`, {
      method: 'POST',
    });
  },

  updateGradingSession: async (sessionId: number, gradingData: any): Promise<any> => {
    return apiRequest(`/api/grading/grading-sessions/${sessionId}/update`, {
      method: 'PUT',
      body: JSON.stringify(gradingData),
    });
  },

  getStudentGradingResult: async (assignmentId: number, studentId: number): Promise<any> => {
    return apiRequest(`/api/grading/assignments/${assignmentId}/students/${studentId}/result`);
  },

  startAIGrading: async (assignmentId: number): Promise<any> => {
    return apiRequest(`/api/grading/assignments/${assignmentId}/start-ai-grading`, {
      method: 'POST',
    });
  },

  getTaskStatus: async (taskId: string): Promise<any> => {
    return apiRequest(`/api/grading/tasks/${taskId}/status`);
  },

  downloadExamPDF: async (worksheetId: number): Promise<void> => {
    const token = tokenStorage.getToken();
    if (!token) throw new Error('Authentication token not found. Please log in.');

    const response = await fetch(`${API_BASE_URL}/api/export/worksheets/${worksheetId}/exam.pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('시험지 PDF 생성에 실패했습니다.');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worksheet_${worksheetId}_exam.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  downloadSolutionPDF: async (worksheetId: number): Promise<void> => {
    const token = tokenStorage.getToken();
    if (!token) throw new Error('Authentication token not found. Please log in.');

    const response = await fetch(
      `${API_BASE_URL}/api/export/worksheets/${worksheetId}/solution.pdf`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!response.ok) throw new Error('해설지 PDF 생성에 실패했습니다.');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worksheet_${worksheetId}_solution.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  deleteAssignment: async (assignmentId: number): Promise<{ message: string }> => {
    return apiRequest(`/api/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  },
};
