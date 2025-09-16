import {
  KoreanFormData,
  KoreanGenerationResponse,
  KoreanWorksheet,
  KoreanProblem,
} from '@/types/korean';

const KOREAN_API_BASE = 'http://localhost:8004/api/korean-generation';

export class KoreanService {
  // 국어 문제 생성
  static async generateKoreanProblems(formData: KoreanFormData): Promise<KoreanGenerationResponse> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${KOREAN_API_BASE}/generate?user_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Korean API Error: ${response.status}`);
    }

    return response.json();
  }

  // 국어 워크시트 목록 가져오기
  static async getKoreanWorksheets(): Promise<KoreanWorksheet[]> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${KOREAN_API_BASE}/worksheets?user_id=${userId}&limit=100`);

    if (!response.ok) {
      throw new Error(`Korean API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.worksheets || [];
  }

  // 국어 워크시트 상세 정보 가져오기
  static async getKoreanWorksheetDetail(
    worksheetId: number,
  ): Promise<{ worksheet: KoreanWorksheet; problems: KoreanProblem[] }> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${KOREAN_API_BASE}/worksheets/${worksheetId}?user_id=${userId}`);

    if (!response.ok) {
      throw new Error(`Korean API Error: ${response.status}`);
    }

    return response.json();
  }

  // 국어 태스크 상태 확인
  static async getKoreanTaskStatus(taskId: string): Promise<any> {
    const response = await fetch(`${KOREAN_API_BASE}/tasks/${taskId}`);

    if (!response.ok) {
      throw new Error(`Korean API Error: ${response.status}`);
    }

    return response.json();
  }

  // 국어 워크시트 업데이트
  static async updateKoreanWorksheet(
    worksheetId: number,
    updateData: any,
  ): Promise<{ success: boolean; message: string }> {
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${KOREAN_API_BASE}/worksheets/${worksheetId}?user_id=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      let errorMessage = `Korean API Error: ${response.status}`;
      try {
        const errorData = await response.text();
        errorMessage += ` - ${errorData}`;
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return { success: true, message: result.message || '국어 워크시트가 업데이트되었습니다.' };
  }

  // 국어 서비스 헬스체크
  static async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch('http://localhost:8004/');

      if (!response.ok) {
        throw new Error(`Korean Service Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: 'healthy',
        message: data.message,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Korean service connection failed',
      };
    }
  }
}
