import { KoreanFormData, KoreanGenerationResponse, KoreanWorksheet, KoreanProblem } from '@/types/korean';

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

    const response = await fetch(`${KOREAN_API_BASE}/worksheets?user_id=${userId}`);

    if (!response.ok) {
      throw new Error(`Korean API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.worksheets || [];
  }

  // 국어 워크시트 상세 정보 가져오기
  static async getKoreanWorksheetDetail(worksheetId: number): Promise<{ worksheet: KoreanWorksheet; problems: KoreanProblem[] }> {
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