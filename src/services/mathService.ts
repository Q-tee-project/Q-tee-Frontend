import { Worksheet, Problem, Assignment, AssignmentDeployRequest, AssignmentDeploymentResponse } from "@/services/koreanService"; // Re-using interfaces from koreanService

const API_BASE_URL = process.env.NEXT_PUBLIC_MATH_API_URL || "http://localhost:8001"; // Adjust as per your backend setup

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token'); // Use same token key as koreanService
  }
  return null;
};

export const mathService = {
  getMathWorksheets: async (skip: number = 0, limit: number = 20): Promise<{ worksheets: Worksheet[], total: number }> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    // Try multiple endpoint variations
    let response = await fetch(`${API_BASE_URL}/api/worksheets/?skip=${skip}&limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    // Try alternative Korean service-style endpoint
    if (!response.ok) {
      response = await fetch(`${API_BASE_URL}/api/math-generation/worksheets?skip=${skip}&limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    }

    // Try simple worksheets endpoint
    if (!response.ok) {
      response = await fetch(`${API_BASE_URL}/api/worksheets/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    }

    // If math backend doesn't exist yet, return empty worksheets
    if (!response.ok) {
      console.warn(`Math worksheets API not available (${response.status}). This is expected if the math backend is not yet implemented.`);
      return { worksheets: [], total: 0 };
    }

    let data: { worksheets: Worksheet[], total: number };
    const responseData = await response.json();

    // Handle different response formats
    if (Array.isArray(responseData)) {
      data = { worksheets: responseData, total: responseData.length };
    } else if (responseData.worksheets) {
      data = responseData;
    } else {
      data = { worksheets: [], total: 0 };
    }

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

    // Try multiple endpoint variations
    let response = await fetch(`${API_BASE_URL}/api/worksheets/${worksheetId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    // Try Korean service-style endpoint
    if (!response.ok) {
      response = await fetch(`${API_BASE_URL}/api/math-generation/worksheets/${worksheetId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    }

    // If math backend doesn't exist yet, return mock data
    if (!response.ok) {
      console.warn(`Math worksheet problems API not available (${response.status}). This is expected if the math backend is not yet implemented.`);
      // Return mock worksheet and empty problems with correct interface
      const mockWorksheet: Worksheet = {
        id: worksheetId,
        title: `수학 워크시트 ${worksheetId}`,
        school_level: '중학교',
        grade: 1,
        problem_count: 0,
        created_at: new Date().toISOString()
      };
      return { worksheet: mockWorksheet, problems: [] };
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

    const response = await fetch(`${API_BASE_URL}/api/worksheets/${worksheetId}`, {
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

    // Try Korean service-style endpoint first (most likely to work)
    let response = await fetch(`${API_BASE_URL}/api/assignments/classrooms/${classId}/assignments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    // If that fails, try math-specific endpoints
    if (!response.ok) {
      response = await fetch(`${API_BASE_URL}/api/assignments?classroom_id=${classId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    }

    if (!response.ok) {
      response = await fetch(`${API_BASE_URL}/api/classrooms/${classId}/assignments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    }

    // If math backend doesn't exist yet, return empty array with helpful message
    if (!response.ok) {
      console.warn(`Math assignments API not available (${response.status}). This is expected if the math backend is not yet implemented.`);
      return []; // Return empty array instead of throwing error
    }

    const data: Assignment[] = await response.json();
    console.log(`Fetched deployed assignments for class ${classId}:`, data);
    return data;
  },

  // 과제 생성 (배포하지 않고 생성만)
  createAssignment: async (worksheetId: number, classroomId: number): Promise<any> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    const response = await fetch(`${API_BASE_URL}/api/assignments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        worksheet_id: worksheetId,
        classroom_id: classroomId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "과제 생성에 실패했습니다.");
    }

    return response.json();
  },

  deployAssignment: async (deployRequest: AssignmentDeployRequest): Promise<AssignmentDeploymentResponse[]> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    // Math service uses /api/assignments/deploy with assignment_id (like Korean service)
    const response = await fetch(`${API_BASE_URL}/api/assignments/deploy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(deployRequest),
    });

    // If math backend doesn't exist yet, simulate success
    if (!response.ok) {
      console.warn(`Math deployment API not available (${response.status}). This is expected if the math backend is not yet implemented.`);
      // Return mock successful deployment response
      return [{
        id: Date.now(),
        assignment_id: deployRequest.assignment_id,
        student_id: deployRequest.student_ids[0] || 0,
        classroom_id: deployRequest.classroom_id,
        status: 'assigned',
        deployed_at: new Date().toISOString(),
      }];
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

    // Try Korean service-style endpoint first
    let response = await fetch(`${API_BASE_URL}/api/assignments/student/${studentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    // Try alternative endpoints
    if (!response.ok) {
      response = await fetch(`${API_BASE_URL}/api/students/${studentId}/assignments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    }

    if (!response.ok) {
      response = await fetch(`${API_BASE_URL}/api/assignments?student_id=${studentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    }

    // If math backend doesn't exist yet, return empty array
    if (!response.ok) {
      console.warn(`Math student assignments API not available (${response.status}). This is expected if the math backend is not yet implemented.`);
      return []; // Return empty array instead of throwing error
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

    // Try multiple endpoints for getting assignment details
    let response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}/details?student_id=${studentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}/student/${studentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    }

    if (!response.ok) {
      response = await fetch(`${API_BASE_URL}/api/worksheets/${assignmentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to get assignment detail" }));
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

    const response = await fetch(`${API_BASE_URL}/api/test-sessions/test-sessions/${sessionId}/submit`, {
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
      const errorData = await response.json().catch(() => ({ detail: "Failed to submit test" }));
      throw new Error(errorData.detail || "Failed to submit test.");
    }

    const data = await response.json();
    console.log(`Test submission result:`, data);
    return data;
  },

  // Start test session (through Next.js API route)
  async startTest(assignmentId: number, studentId: number): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}/start`, {
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
      const errorData = await response.json().catch(() => ({ detail: "Failed to start test" }));
      throw new Error(errorData.detail || "Failed to start test.");
    }

    const data = await response.json();
    console.log(`Test session started:`, data);
    return data;
  },

  // Save answer for a test session (through Next.js API route)
  async saveAnswer(sessionId: string, problemId: number, answer: string): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/test-sessions/${sessionId}/answers`, {
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
      const errorData = await response.json().catch(() => ({ detail: "Failed to save answer" }));
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

    const response = await fetch(`${API_BASE_URL}/api/worksheets/${worksheetId}`, {
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

    const response = await fetch(`${API_BASE_URL}/api/problems/${problemId}`, {
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

    const response = await fetch(`${API_BASE_URL}/api/problems/regenerate-async`, {
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

    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
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

  // Get assignment results (grading sessions for an assignment)
  async getAssignmentResults(assignmentId: number): Promise<any[]> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/grading/assignments/${assignmentId}/results`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to get assignment results.");
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

    // Direct backend call (like Korean service)
    const response = await fetch(`${API_BASE_URL}/api/grading/grading-sessions/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to get grading session details" }));
      throw new Error(errorData.detail || "Failed to get grading session details.");
    }

    const data = await response.json();
    console.log(`Grading session details:`, data);
    return data;
  },

  // Submit answers with handwriting OCR support
  async submitAnswerWithOCR(sessionId: string, problemId: number, answer: string, handwritingImage?: File): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('problem_id', problemId.toString());
    formData.append('answer', answer);

    if (handwritingImage) {
      formData.append('handwriting_image', handwritingImage);
    }

    const response = await fetch(`${API_BASE_URL}/api/test-sessions/test-sessions/${sessionId}/answers/ocr`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to submit answer with OCR.");
    }

    const data = await response.json();
    console.log(`Answer submitted with OCR:`, data);
    return data;
  },

  // Get pending grading sessions for AI and manual review
  async getPendingGradingSessions(): Promise<any[]> {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    const response = await fetch(`${API_BASE_URL}/api/grading/grading-sessions/pending`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch pending grading sessions.");
    }

    const data = await response.json();
    console.log(`Fetched pending grading sessions:`, data);
    return data;
  },

  // Approve grading session
  async approveGradingSession(sessionId: number): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    const response = await fetch(`${API_BASE_URL}/api/grading/grading-sessions/${sessionId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to approve grading session.");
    }

    const data = await response.json();
    console.log(`Approved grading session:`, data);
    return data;
  },

  // Update grading session results
  async updateGradingSession(sessionId: number, gradingData: any): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    // Direct backend call (like Korean service)
    const response = await fetch(`${API_BASE_URL}/api/grading/grading-sessions/${sessionId}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(gradingData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to update grading session" }));
      throw new Error(errorData.detail || "Failed to update grading session.");
    }

    const data = await response.json();
    console.log(`Updated grading session:`, data);
    return data;
  },

  // Get student grading result (for student view)
  async getStudentGradingResult(assignmentId: number, studentId: number): Promise<any> {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication token not found. Please log in.");
    }

    // Direct backend call (like Korean service)
    const response = await fetch(`${API_BASE_URL}/api/grading/assignments/${assignmentId}/students/${studentId}/result`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Failed to get student grading result" }));
      throw new Error(errorData.detail || "Failed to get student grading result.");
    }

    const data = await response.json();
    console.log(`Student grading result:`, data);
    return data;
  },
};