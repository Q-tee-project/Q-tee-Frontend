import { apiRequest } from '@/lib/api';
import { 
  Categories, 
  QuestionFormData, 
  QuestionGenerationResponse,
  Question 
} from '@/types/api';

export class QuestionService {
  // 카테고리 정보 가져오기 (영어 서비스용)
  static async getCategories(): Promise<Categories> {
    return apiRequest<Categories>('/categories');
  }

  // 수학 워크시트 목록 가져오기
  static async getWorksheets(): Promise<any[]> {
    return apiRequest<{worksheets: any[]}>('/api/math-generation/worksheets')
      .then(response => response.worksheets);
  }

  // 특정 워크시트의 상세 정보 가져오기 (문제 포함)
  static async getWorksheetDetail(worksheetId: number): Promise<any> {
    return apiRequest<any>(`/api/math-generation/worksheets/${worksheetId}`);
  }

  // 수학 문제 생성
  static async generateMathProblems(formData: any): Promise<any> {
    return apiRequest<any>('/api/math-generation/generate', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  // 태스크 상태 확인 (문제 생성 진행 상태)
  static async getTaskStatus(taskId: string): Promise<any> {
    return apiRequest<any>(`/api/math-generation/tasks/${taskId}`);
  }

  // 교육과정 구조 가져오기
  static async getCurriculumStructure(schoolLevel?: string): Promise<any> {
    const params = schoolLevel ? `?school_level=${encodeURIComponent(schoolLevel)}` : '';
    return apiRequest<any>(`/api/math-generation/curriculum/structure${params}`);
  }

  // 대단원 목록 가져오기
  static async getUnits(): Promise<any> {
    return apiRequest<any>('/api/math-generation/curriculum/units');
  }

  // 소단원 목록 가져오기
  static async getChaptersByUnit(unitName: string): Promise<any> {
    return apiRequest<any>(`/api/math-generation/curriculum/chapters?unit_name=${encodeURIComponent(unitName)}`);
  }

  // 생성 히스토리 가져오기
  static async getGenerationHistory(skip: number = 0, limit: number = 10): Promise<any> {
    return apiRequest<any>(`/api/math-generation/generation/history?skip=${skip}&limit=${limit}`);
  }

  // 문제 목록 가져오기 (워크시트 기반으로 변환)
  static async getQuestions(): Promise<Question[]> {
    try {
      const worksheets = await this.getWorksheets();
      const questions: Question[] = [];
      
      for (const worksheet of worksheets.slice(0, 6)) { // 최대 6개만
        questions.push({
          id: worksheet.id,
          type: worksheet.grade === 1 ? '중1' : `중${worksheet.grade}`,
          difficulty: '1등급', // 기본값
          title: worksheet.title.length > 15 ? worksheet.title.substring(0, 15) + '...' : worksheet.title,
          date: new Date(worksheet.created_at).toLocaleDateString('ko-KR').replace(/\./g, '.').slice(0, -1),
          subject: '수학',
          questionText: `${worksheet.unit_name} > ${worksheet.chapter_name}`,
          correctAnswer: '1'
        });
      }
      
      return questions;
    } catch (error) {
      console.error('워크시트 목록 조회 실패:', error);
      return [];
    }
  }

  // 문제지 저장
  static async saveQuestions(questions: string): Promise<{ success: boolean; message: string }> {
    // 실제 구현은 추후
    console.log('문제지 저장:', questions);
    return Promise.resolve({ success: true, message: '문제지가 저장되었습니다.' });
  }

  // 문제지 배포
  static async deployQuestions(questions: string): Promise<{ success: boolean; message: string }> {
    // 실제 구현은 추후
    console.log('문제지 배포:', questions);
    return Promise.resolve({ success: true, message: '문제지가 배포되었습니다.' });
  }

  // 워크시트 삭제
  static async deleteWorksheet(worksheetId: number): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ message: string; worksheet_id: number; deleted_at: string }>(`/api/math-generation/worksheets/${worksheetId}`, {
      method: 'DELETE',
    }).then(response => ({ success: true, message: response.message }));
  }

  // 워크시트 업데이트
  static async updateWorksheet(worksheetId: number, updateData: any): Promise<{ success: boolean; message: string }> {
    return apiRequest<any>(`/api/math-generation/worksheets/${worksheetId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }).then(response => ({ success: true, message: response.message || '워크시트가 업데이트되었습니다.' }));
  }

  // 개별 문제 업데이트
  static async updateProblem(problemId: number, updateData: any): Promise<{ success: boolean; message: string }> {
    return apiRequest<any>(`/api/math-generation/problems/${problemId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }).then(response => ({ success: true, message: response.message || '문제가 업데이트되었습니다.' }));
  }

  // 헬스체크
  static async healthCheck(): Promise<{ status: string; message: string }> {
    return apiRequest<{ message: string }>('/')
      .then(response => ({ status: 'healthy', message: response.message }));
  }
}