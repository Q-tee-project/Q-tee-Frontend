import {
  EnglishFormData,
  EnglishGenerationResponse,
  EnglishWorksheet,
  EnglishProblem,
  EnglishWorksheetDetail,
  EnglishLLMResponseAndRequest,
} from '@/types/english';

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

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${ENGLISH_API_BASE}/worksheets?user_id=${userId}&limit=100`);

    if (!response.ok) {
      throw new Error(`English API Error: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  }

  // 영어 워크시트 상세 정보 가져오기
  static async getEnglishWorksheetDetail(
    worksheetId: string | number,
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
    worksheetData: EnglishLLMResponseAndRequest,
  ): Promise<{ worksheet_id: string; message: string }> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

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
      worksheet_id: result.worksheet_id || worksheetData.worksheet_id,
      message: result.message || '영어 워크시트가 저장되었습니다.',
    };
  }

  // 영어 문제 수정
  static async updateEnglishQuestion(
    worksheetId: string,
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
    worksheetId: string,
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
    worksheetId: string,
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
}
