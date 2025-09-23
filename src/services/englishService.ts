import {
  EnglishWorksheetGeneratorFormData,
  EnglishGenerationResponse,
  EnglishWorksheetData,
  EnglishQuestion,
  EnglishRegenerationInfo,
  EnglishRegenerationRequest,
  EnglishRegenerationResponse,
  EnglishDataRegenerationRequest,
} from '@/types/english';

// 타입 별칭 생성 (기존 코드 호환성)
type EnglishFormData = EnglishWorksheetGeneratorFormData;
type EnglishWorksheet = EnglishWorksheetData;
type EnglishProblem = EnglishQuestion;
type EnglishWorksheetDetail = EnglishWorksheetData;
type EnglishLLMResponseAndRequest = EnglishWorksheetData;

// 영어 과제 배포 요청 (백엔드 API와 일치)
export interface EnglishAssignmentDeployRequest {
  assignment_id: number;     // 영어 워크시트 ID (백엔드에서는 assignment_id로 요구)
  classroom_id: number;      // 클래스룸 ID
  student_ids: number[];     // 학생 ID 목록
}

const ENGLISH_API_BASE = 'http://localhost:8002/api/english';

export class EnglishService {
  // 영어 문제 생성
  static async generateEnglishProblems(
    formData: EnglishFormData,
  ): Promise<EnglishGenerationResponse> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${ENGLISH_API_BASE}/worksheet-generate?user_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`English API Error: ${response.status}`);
    }

    return response.json();
  }

  // 영어 워크시트 목록 가져오기
  static async getEnglishWorksheets(): Promise<EnglishWorksheet[]> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    console.log('📚 영어 워크시트 API 호출 - userId:', userId);

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const apiUrl = `${ENGLISH_API_BASE}/worksheets?user_id=${userId}&limit=100`;
    console.log('📚 영어 워크시트 API URL:', apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error('📚 영어 워크시트 API 에러:', response.status, response.statusText);
      throw new Error(`English API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📚 영어 워크시트 원시 데이터:', data);
    console.log('📚 영어 워크시트 반환 데이터:', data || []);
    return data || [];
  }

  // 영어 워크시트 상세 정보 가져오기
  static async getEnglishWorksheetDetail(
    worksheetId: number,
  ): Promise<EnglishWorksheetDetail> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${ENGLISH_API_BASE}/worksheets/${worksheetId}?user_id=${userId}`);

    if (!response.ok) {
      throw new Error(`English API Error: ${response.status}`);
    }

    return response.json();
  }

  // 영어 태스크 상태 확인
  static async getEnglishTaskStatus(taskId: string): Promise<any> {
    const response = await fetch(`${ENGLISH_API_BASE}/tasks/${taskId}`);

    if (!response.ok) {
      throw new Error(`English API Error: ${response.status}`);
    }

    return response.json();
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

    const response = await fetch(
      `${ENGLISH_API_BASE}/worksheets/${worksheetId}?user_id=${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      },
    );

    if (!response.ok) {
      let errorMessage = `English API Error: ${response.status}`;
      try {
        const errorData = await response.text();
        errorMessage += ` - ${errorData}`;
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
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

    console.log('💾 저장할 워크시트 데이터:', worksheetData);
    console.log('💾 questions 샘플:', worksheetData.questions?.[0]);

    const response = await fetch(`${ENGLISH_API_BASE}/worksheet-save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(worksheetData),
    });

    if (!response.ok) {
      let errorMessage = `English API Error: ${response.status}`;
      try {
        const errorData = await response.text();
        errorMessage += ` - ${errorData}`;
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
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

    const response = await fetch(
      `${ENGLISH_API_BASE}/worksheets/${worksheetId}/questions/${questionId}?user_id=${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      },
    );

    if (!response.ok) {
      throw new Error(`English API Error: ${response.status}`);
    }

    const result = await response.json();
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

    const response = await fetch(
      `${ENGLISH_API_BASE}/worksheets/${worksheetId}/passages/${passageId}?user_id=${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      },
    );

    if (!response.ok) {
      throw new Error(`English API Error: ${response.status}`);
    }

    const result = await response.json();
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

    const response = await fetch(
      `${ENGLISH_API_BASE}/worksheets/${worksheetId}/title?user_id=${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ worksheet_name: newTitle }),
      },
    );

    if (!response.ok) {
      throw new Error(`English API Error: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, message: result.message || '영어 워크시트 제목이 업데이트되었습니다.' };
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

    const response = await fetch(
      `${ENGLISH_API_BASE}/worksheets/${worksheetId}/questions/${questionId}/regeneration-info?user_id=${userId}`
    );

    if (!response.ok) {
      throw new Error(`English API Error: ${response.status}`);
    }

    return response.json();
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

    const response = await fetch(
      `${ENGLISH_API_BASE}/worksheets/${worksheetId}/questions/${questionId}/regenerate?user_id=${userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(regenerationData),
      },
    );

    if (!response.ok) {
      let errorMessage = `English API Error: ${response.status}`;
      try {
        const errorData = await response.text();
        errorMessage += ` - ${errorData}`;
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // 영어 문제 재생성 (데이터 기반) - v2.0 API
  static async regenerateEnglishQuestionFromData(
    questionData: any,
    passageData: any | null,
    regenerationRequest: EnglishRegenerationRequest,
  ): Promise<EnglishRegenerationResponse> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const requestBody: EnglishDataRegenerationRequest = {
      question_data: questionData,
      passage_data: passageData,
      regeneration_request: regenerationRequest,
    };

    const response = await fetch(
      `${ENGLISH_API_BASE}/questions/regenerate-data?user_id=${userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!response.ok) {
      let errorMessage = `English API Error: ${response.status}`;
      try {
        const errorData = await response.text();
        errorMessage += ` - ${errorData}`;
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // 영어 서비스 헬스체크
  static async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch('http://localhost:8002/');

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

    const response = await fetch(`${ENGLISH_API_BASE}/assignments/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deployRequest),
    });

    if (!response.ok) {
      let errorMessage = `English API Error: ${response.status}`;
      try {
        const errorData = await response.text();
        errorMessage += ` - ${errorData}`;
        console.error('📤 영어 과제 배포 실패:', errorData);
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // 영어 배포된 과제 목록 조회
  static async getDeployedAssignments(classId: string): Promise<any[]> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(
      `${ENGLISH_API_BASE}/assignments/deployed?classroom_id=${classId}&user_id=${userId}`
    );

    if (!response.ok) {
      throw new Error(`English API Error: ${response.status}`);
    }

    const data = await response.json();
    return data?.assignments || [];
  }

  // 영어 과제 상세 정보 조회 (학생용)
  static async getAssignmentDetail(assignmentId: number, studentId: number): Promise<any> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(
      `${ENGLISH_API_BASE}/assignments/${assignmentId}/student/${studentId}?user_id=${userId}`
    );

    if (!response.ok) {
      throw new Error(`English API Error: ${response.status}`);
    }

    return response.json();
  }

  // 영어 학생 과제 목록 조회
  static async getStudentAssignments(studentId: number): Promise<any[]> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(
      `${ENGLISH_API_BASE}/assignments/student/${studentId}?user_id=${userId}`
    );

    if (!response.ok) {
      throw new Error(`English API Error: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  }

  // 영어 과제 제출
  static async submitTest(assignmentId: number, studentId: number, answers: Record<number, string>): Promise<any> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const submissionData = {
      assignment_id: assignmentId,
      student_id: studentId,
      answers: answers,
      user_id: userId
    };

    console.log('📤 영어 과제 제출 데이터:', submissionData);

    const response = await fetch(`${ENGLISH_API_BASE}/assignments/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
      let errorMessage = `English API Error: ${response.status}`;
      try {
        const errorData = await response.text();
        errorMessage += ` - ${errorData}`;
        console.error('📤 영어 과제 제출 실패:', errorData);
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('📤 영어 과제 제출 성공:', result);
    return result;
  }
}
