import { Worksheet, MathProblem } from '@/types/math';
import {
  Assignment,
  AssignmentDeployRequest,
  AssignmentDeploymentResponse,
} from '@/services/koreanService';
import { tokenStorage } from './authService';

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
    throw new Error(errorData.detail || `Request failed: ${response.status}`);
  }

  return response.json();
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
    return apiRequest(`/api/worksheets/${worksheetId}`);
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

  getStudentAssignments: async (studentId: number): Promise<Assignment[]> => {
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
};
