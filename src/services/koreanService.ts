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

const API_BASE_URL = process.env.NEXT_PUBLIC_KOREAN_SERVICE_URL || 'http://localhost:8004/api'; // Adjust as per your backend setup

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token'); // Changed to 'access_token'
  }
  return null;
};

export const koreanService = {
  getKoreanWorksheets: async (
    skip: number = 0,
    limit: number = 1000,
  ): Promise<{ worksheets: KoreanWorksheet[]; total: number }> => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(
      `${API_BASE_URL}/korean-generation/worksheets?skip=${skip}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch Korean worksheets.');
    }

    const data: { worksheets: KoreanWorksheet[]; total: number } = await response.json();
    console.log(`Fetched Korean worksheets:`, data);
    return data;
  },

  getKoreanWorksheetProblems: async (
    worksheetId: number,
  ): Promise<{ worksheet: KoreanWorksheet; problems: Problem[] }> => {
    // Updated return type
    const token = getToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/korean-generation/worksheets/${worksheetId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch Korean worksheet problems.');
    }

    const data: { worksheet: KoreanWorksheet; problems: Problem[] } = await response.json(); // Updated type
    console.log(`Fetched Korean worksheet problems:`, data);
    return data;
  },

  deleteKoreanWorksheet: async (worksheetId: number): Promise<void> => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/korean-generation/worksheets/${worksheetId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete Korean worksheet.');
    }
    console.log(`Deleted Korean worksheet: ${worksheetId}`);
  },

  getDeployedAssignments: async (classId: string): Promise<Assignment[]> => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/assignments/classrooms/${classId}/assignments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch deployed assignments.');
    }

    const data: Assignment[] = await response.json();
    console.log(`Fetched deployed assignments for class ${classId}:`, data);
    return data;
  },

  deployAssignment: async (
    deployRequest: AssignmentDeployRequest,
  ): Promise<AssignmentDeploymentResponse[]> => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/assignments/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(deployRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to deploy assignment.');
    }

    const data: AssignmentDeploymentResponse[] = await response.json();
    console.log(`Deployed assignment:`, data);
    return data;
  },

  // Get student assignments (deployed assignments for a specific student)
  async getStudentAssignments(studentId: number): Promise<Assignment[]> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/assignments/student/${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get student assignments.');
    }

    const data: Assignment[] = await response.json();
    console.log(`Student assignments:`, data);
    return data;
  },

  // Get assignment detail (for starting a test)
  async getAssignmentDetail(assignmentId: number, studentId: number): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `${API_BASE_URL}/assignments/${assignmentId}/student/${studentId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get assignment detail.');
    }

    const data = await response.json();
    console.log(`Assignment detail:`, data);
    return data;
  },

  // Submit test results
  async submitTest(assignmentId: number, studentId: number, answers: any): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        student_id: studentId,
        answers: answers,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit test.');
    }

    const data = await response.json();
    console.log(`Test submission result:`, data);
    return data;
  },

  // Get assignment results (grading sessions for an assignment)
  async getAssignmentResults(assignmentId: number): Promise<any[]> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/grading/assignments/${assignmentId}/results`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get assignment results.');
    }

    const data = await response.json();
    console.log(`Assignment results:`, data);
    return data;
  },

  // Get detailed grading session results
  async getGradingSessionDetails(sessionId: number): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/grading/grading-sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get grading session details.');
    }

    const data = await response.json();
    console.log(`Grading session details:`, data);
    return data;
  },

  // Get student's grading result for a specific assignment
  async getStudentGradingResult(assignmentId: number, studentId: number): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // First get assignment results to find the grading session
    const assignmentResults = await this.getAssignmentResults(assignmentId);
    const resultsArray = Array.isArray(assignmentResults)
      ? assignmentResults
      : (assignmentResults as any).results || [];
    const studentSession = resultsArray.find((session: any) => session.student_id === studentId);

    if (!studentSession) {
      throw new Error('No grading result found for this student');
    }

    // Get detailed session info
    const sessionDetails = await this.getGradingSessionDetails(
      studentSession.grading_session_id || studentSession.id,
    );
    return sessionDetails;
  },

  // Update grading session results
  async updateGradingSession(sessionId: number, gradingData: any): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`${API_BASE_URL}/grading/grading-sessions/${sessionId}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(gradingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update grading session.');
    }

    const data = await response.json();
    console.log(`Updated grading session:`, data);
    return data;
  },

  async updateKoreanWorksheet(worksheetId: number, data: any): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/korean-generation/worksheets/${worksheetId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update worksheet.');
    }

    const responseData = await response.json();
    console.log(`Worksheet updated:`, responseData);
    return responseData;
  },

  async updateProblem(problemId: number, data: any): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/korean-generation/problems/${problemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update problem.');
    }

    const responseData = await response.json();
    console.log(`Problem updated:`, responseData);
    return responseData;
  },

  async regenerateProblemAsync(data: any): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/korean-generation/problems/regenerate-async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to regenerate problem.');
    }

    const responseData = await response.json();
    console.log(`Problem regeneration started:`, responseData);
    return responseData;
  },

  async getTaskStatus(taskId: string): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/korean-generation/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get task status.');
    }

    const responseData = await response.json();
    console.log(`Task status:`, responseData);
    return responseData;
  },
};
