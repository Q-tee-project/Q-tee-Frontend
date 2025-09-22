import { Worksheet, Problem, Assignment, AssignmentDeployRequest, AssignmentDeploymentResponse } from "@/services/koreanService"; // Re-using interfaces from koreanService

const API_BASE_URL = process.env.NEXT_PUBLIC_MATH_API_URL || "http://localhost:8001"; // Adjust as per your backend setup

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token'); // Changed to 'access_token'
  }
  return null;
};

export const mathService = {
  getMathWorksheets: async (skip: number = 0, limit: number = 20): Promise<{ worksheets: Worksheet[], total: number }> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    const response = await fetch(`${API_BASE_URL}/worksheets?skip=${skip}&limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch Math worksheets.");
    }

    const data: { worksheets: Worksheet[], total: number } = await response.json();
    console.log(`Fetched Math worksheets:`, data);
    return data;
  },

  getMathWorksheetProblems: async (
    worksheetId: number,
  ): Promise<{ worksheet: Worksheet; problems: Problem[] }> => { // Updated return type
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    const response = await fetch(
      `${API_BASE_URL}/worksheets/${worksheetId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch Math worksheet problems.");
    }

    const data: { worksheet: Worksheet; problems: Problem[] } = await response.json(); // Updated type
    console.log(`Fetched Math worksheet problems:`, data);
    return data;
  },

  deleteMathWorksheet: async (worksheetId: number): Promise<void> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    const response = await fetch(`${API_BASE_URL}/worksheets/${worksheetId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to delete Math worksheet.");
    }
    console.log(`Deleted Math worksheet: ${worksheetId}`);
  },

  getDeployedAssignments: async (classId: string): Promise<Assignment[]> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    const response = await fetch(`${API_BASE_URL}/assignments/classrooms/${classId}/assignments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch deployed assignments.");
    }

    const data: Assignment[] = await response.json();
    console.log(`Fetched deployed assignments for class ${classId}:`, data);
    return data;
  },

  deployAssignment: async (deployRequest: AssignmentDeployRequest): Promise<AssignmentDeploymentResponse[]> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    const response = await fetch(`${API_BASE_URL}/assignments/deploy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(deployRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to deploy assignment.");
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
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to get student assignments.");
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

    const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/student/${studentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to get assignment detail.");
    }

    const data = await response.json();
    console.log(`Assignment detail:`, data);
    return data;
  },

  // Submit test results (for test sessions)
  async submitTest(sessionId: string, answers: any): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/test-sessions/${sessionId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        answers: answers
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to submit test.");
    }

    const data = await response.json();
    console.log(`Test submission result:`, data);
    return data;
  },

  // Start test session
  async startTest(assignmentId: number, studentId: number): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        student_id: studentId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to start test.");
    }

    const data = await response.json();
    console.log(`Test session started:`, data);
    return data;
  },

  // Save answer for a test session
  async saveAnswer(sessionId: string, problemId: number, answer: string): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/test-sessions/${sessionId}/answers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        problem_id: problemId,
        answer: answer
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to save answer.");
    }

    const data = await response.json();
    console.log(`Answer saved:`, data);
    return data;
  },

  async updateMathWorksheet(worksheetId: number, data: any): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/worksheets/${worksheetId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update worksheet.");
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

    const response = await fetch(`${API_BASE_URL}/problems/${problemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update problem.");
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

    const response = await fetch(`${API_BASE_URL}/problems/regenerate-async`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to regenerate problem.");
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

    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to get task status.");
    }

    const responseData = await response.json();
    console.log(`Task status:`, responseData);
    return responseData;
  },
};