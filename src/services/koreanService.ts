// Base Worksheet interface
export interface Worksheet {
  id: number;
  title: string;
  school_level: string;
  grade: number;
  problem_count: number;
  created_at: string;
  // Add other common fields if necessary
}

// Korean-specific Worksheet interface extending the base Worksheet
export interface KoreanWorksheet extends Worksheet {
  korean_type: string;
  question_type: string;
  difficulty: string;
  question_type_ratio: any; // Adjust type if a more specific schema is available
  difficulty_ratio: any; // Adjust type if a more specific schema is available
  user_text: string | null;
  actual_korean_type_distribution: any; // Adjust type
  actual_question_type_distribution: any; // Adjust type
  actual_difficulty_distribution: any; // Adjust type
  status: string;
}

// Problem interface
export interface Problem {
  id: number;
  sequence_order: number;
  korean_type?: string;
  problem_type: string;
  difficulty: string;
  question: string;
  choices?: string[];
  correct_answer: string;
  explanation: string;
  source_text?: string;
  source_title?: string;
  source_author?: string;
}

// Define types for Assignment (should match backend schema)
export interface Assignment {
  id: number;
  title: string;
  worksheet_id: number;
  classroom_id: number;
  teacher_id: number;
  korean_type: string;
  question_type: string;
  problem_count: number;
  is_deployed: string; // e.g., "deployed", "pending"
  created_at: string;
}

// Define types for AssignmentDeploymentResponse (should match backend schema)
export interface AssignmentDeploymentResponse {
  id: number;
  assignment_id: number;
  student_id: number;
  classroom_id: number;
  status: string; // e.g., "assigned", "completed"
  deployed_at: string;
}

export interface AssignmentDeployRequest {
  assignment_id: number;
  classroom_id: number;
  student_ids: number[];
}

import { tokenStorage } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_KOREAN_SERVICE_URL || 'http://localhost:8004/api';

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

export const koreanService = {
  getKoreanWorksheets: async (
    skip: number = 0,
    limit: number = 1000,
  ): Promise<{ worksheets: KoreanWorksheet[]; total: number }> => {
    return apiRequest(`/korean-generation/worksheets?skip=${skip}&limit=${limit}`);
  },

  getKoreanWorksheetProblems: async (
    worksheetId: number,
  ): Promise<{ worksheet: KoreanWorksheet; problems: Problem[] }> => {
    return apiRequest(`/korean-generation/worksheets/${worksheetId}`);
  },

  deleteKoreanWorksheet: async (worksheetId: number): Promise<void> => {
    return apiRequest(`/korean-generation/worksheets/${worksheetId}`, { method: 'DELETE' });
  },

  getDeployedAssignments: async (classId: string): Promise<Assignment[]> => {
    return apiRequest(`/assignments/classrooms/${classId}/assignments`);
  },

  deployAssignment: async (
    deployRequest: AssignmentDeployRequest,
  ): Promise<AssignmentDeploymentResponse[]> => {
    return apiRequest('/assignments/deploy', {
      method: 'POST',
      body: JSON.stringify(deployRequest),
    });
  },

  createAssignment: async (worksheetId: number, classroomId: number): Promise<any> => {
    return apiRequest('/assignments/create', {
      method: 'POST',
      body: JSON.stringify({ worksheet_id: worksheetId, classroom_id: classroomId }),
    });
  },

  getStudentAssignments: async (studentId: number): Promise<Assignment[]> => {
    return apiRequest(`/assignments/student/${studentId}`);
  },

  getAssignmentDetail: async (assignmentId: number, studentId: number): Promise<any> => {
    return apiRequest(`/assignments/${assignmentId}/student/${studentId}`);
  },

  submitTest: async (assignmentId: number, studentId: number, answers: any): Promise<any> => {
    return apiRequest(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, answers }),
    });
  },

  getAssignmentResults: async (assignmentId: number): Promise<any[]> => {
    return apiRequest(`/grading/assignments/${assignmentId}/results`);
  },

  getGradingSessionDetails: async (sessionId: number): Promise<any> => {
    return apiRequest(`/grading/grading-sessions/${sessionId}`);
  },

  getStudentGradingResult: async (assignmentId: number, studentId: number): Promise<any> => {
    const assignmentResults = await koreanService.getAssignmentResults(assignmentId);
    const resultsArray = Array.isArray(assignmentResults)
      ? assignmentResults
      : (assignmentResults as any).results || [];
    const studentSession = resultsArray.find((session: any) => session.student_id === studentId);

    if (!studentSession) {
      throw new Error('No grading result found for this student');
    }

    return koreanService.getGradingSessionDetails(
      studentSession.grading_session_id || studentSession.id,
    );
  },

  updateGradingSession: async (sessionId: number, gradingData: any): Promise<any> => {
    return apiRequest(`/grading/grading-sessions/${sessionId}/update`, {
      method: 'PUT',
      body: JSON.stringify(gradingData),
    });
  },

  updateKoreanWorksheet: async (worksheetId: number, data: any): Promise<any> => {
    return apiRequest(`/korean-generation/worksheets/${worksheetId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateProblem: async (problemId: number, data: any): Promise<any> => {
    return apiRequest(`/korean-generation/problems/${problemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  regenerateProblemAsync: async (data: any): Promise<any> => {
    return apiRequest('/korean-generation/problems/regenerate-async', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getTaskStatus: async (taskId: string): Promise<any> => {
    return apiRequest(`/korean-generation/tasks/${taskId}`);
  },
};
