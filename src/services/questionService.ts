import { apiRequest, API_BASE_URL } from '@/lib/api';
import { Categories, QuestionFormData, QuestionGenerationResponse, Question } from '@/types/api';

export class QuestionService {
  // 카테고리 정보 가져오기 (영어 서비스용)
  static async getCategories(): Promise<Categories> {
    return apiRequest<Categories>('/categories');
  }

  // 수학 워크시트 목록 가져오기
  static async getWorksheets(): Promise<any[]> {
    // 현재 로그인한 사용자 정보 가져오기
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    return apiRequest<{ worksheets: any[] }>(
      `/api/math-generation/worksheets?user_id=${userId}`,
    ).then((response) => response.worksheets);
  }

  // 특정 워크시트의 상세 정보 가져오기 (문제 포함)
  static async getWorksheetDetail(worksheetId: number): Promise<any> {
    // 현재 로그인한 사용자 정보 가져오기
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('로그인이 필요합니다.');
    }

    return apiRequest<any>(`/api/math-generation/worksheets/${worksheetId}?user_id=${userId}`);
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
    return apiRequest<any>(
      `/api/math-generation/curriculum/chapters?unit_name=${encodeURIComponent(unitName)}`,
    );
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

      for (const worksheet of worksheets.slice(0, 6)) {
        // 최대 6개만
        questions.push({
          id: worksheet.id,
          type: worksheet.grade === 1 ? '중1' : `중${worksheet.grade}`,
          difficulty: '1등급', // 기본값
          title:
            worksheet.title.length > 15
              ? worksheet.title.substring(0, 15) + '...'
              : worksheet.title,
          date: new Date(worksheet.created_at)
            .toLocaleDateString('ko-KR')
            .replace(/\./g, '.')
            .slice(0, -1),
          subject: '수학',
          questionText: `${worksheet.unit_name} > ${worksheet.chapter_name}`,
          correctAnswer: '1',
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
  static async deleteWorksheet(
    worksheetId: number,
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ message: string; worksheet_id: number; deleted_at: string }>(
      `/api/math-generation/worksheets/${worksheetId}`,
      {
        method: 'DELETE',
      },
    ).then((response) => ({ success: true, message: response.message }));
  }

  // 워크시트 업데이트
  static async updateWorksheet(
    worksheetId: number,
    updateData: any,
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest<any>(`/api/math-generation/worksheets/${worksheetId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }).then((response) => ({
      success: true,
      message: response.message || '워크시트가 업데이트되었습니다.',
    }));
  }

  // 개별 문제 업데이트
  static async updateProblem(
    problemId: number,
    updateData: any,
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest<any>(`/api/math-generation/problems/${problemId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }).then((response) => ({
      success: true,
      message: response.message || '문제가 업데이트되었습니다.',
    }));
  }

  // 헬스체크
  static async healthCheck(): Promise<{ status: string; message: string }> {
    return apiRequest<{ message: string }>('/').then((response) => ({
      status: 'healthy',
      message: response.message,
    }));
  }

  // ===== 시험 관련 API =====

  // 시험 시작 (간소화 - 세션 ID 생성)
  static async startTest(worksheetId: number, studentId?: string): Promise<any> {
    // 실제 백엔드 세션이 없으므로 클라이언트에서 세션 ID 생성
    const sessionId = `test_session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    return Promise.resolve({
      session_id: sessionId,
      worksheet_id: worksheetId,
      student_id: studentId || 'anonymous',
      started_at: new Date().toISOString(),
    });
  }

  // 답안 임시 저장 (로컬 스토리지 활용)
  static async saveAnswer(testSessionId: string, problemId: number, answer: string): Promise<any> {
    const key = `${testSessionId}_answers`;
    const existingAnswers = JSON.parse(localStorage.getItem(key) || '{}');
    existingAnswers[problemId] = answer;
    localStorage.setItem(key, JSON.stringify(existingAnswers));
    return Promise.resolve({ success: true });
  }

  // 시험 제출 및 채점 (grade-mixed API 활용)
  static async submitTest(testSessionId: string, answers: Record<number, string>): Promise<any> {
    // 세션 ID에서 워크시트 및 문제 데이터 추출
    const sessionData = JSON.parse(localStorage.getItem(`${testSessionId}_data`) || '{}');
    const worksheetId = sessionData.worksheet_id;
    const problems = sessionData.problems || [];

    if (!worksheetId) {
      throw new Error('워크시트 ID를 찾을 수 없습니다.');
    }

    // 객관식과 주관식 답안 분리
    const multipleChoiceAnswers: Record<string, string> = {};
    const canvasAnswers: Record<string, string> = {};

    problems.forEach((problem: any) => {
      const answer = answers[problem.id];
      if (answer) {
        if (problem.problem_type === 'multiple_choice') {
          multipleChoiceAnswers[`problem_${problem.id}`] = answer;
        } else {
          // 주관식/서술형 답안은 canvas_answers로 전송
          canvasAnswers[`problem_${problem.id}`] = answer;
        }
      }
    });

    console.log('전송할 답안 데이터:', {
      multiple_choice_answers: multipleChoiceAnswers,
      canvas_answers: canvasAnswers,
    });

    // grade-canvas API 스타일로 JSON 데이터 전송
    const result = await apiRequest<any>(
      `/api/math-generation/worksheets/${worksheetId}/grade-canvas`,
      {
        method: 'POST',
        body: JSON.stringify({
          multiple_choice_answers: multipleChoiceAnswers,
          canvas_answers: canvasAnswers,
        }),
      },
    );
    console.log('백엔드 채점 응답:', result);

    // 백엔드가 task_id를 반환하므로 task 완료까지 대기
    if (result.task_id) {
      // Task 완료까지 대기
      const finalResult = await this.waitForTaskCompletion(result.task_id);
      return this.formatGradingResult(finalResult.result, answers, problems);
    }

    // 직접 결과가 반환된 경우
    return this.formatGradingResult(result, answers, problems);
  }

  // Task 완료까지 대기하는 메서드
  private static async waitForTaskCompletion(taskId: string): Promise<any> {
    let attempts = 0;
    const maxAttempts = 30; // 최대 30초 대기

    while (attempts < maxAttempts) {
      const taskStatus = await this.getTaskStatus(taskId);

      if (taskStatus.status === 'SUCCESS') {
        return taskStatus;
      } else if (taskStatus.status === 'FAILURE') {
        throw new Error(`채점 실패: ${taskStatus.message || '알 수 없는 오류'}`);
      }

      // 1초 대기
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('채점 처리 시간이 초과되었습니다.');
  }

  // 채점 결과를 우리 형식으로 변환
  private static formatGradingResult(
    backendResult: any,
    originalAnswers: Record<number, string>,
    problems: any[],
  ): any {
    const problemResults = problems.map((problem) => {
      const userAnswer = originalAnswers[problem.id] || '';
      const correctAnswer = problem.correct_answer;

      // 간단한 정답 비교 (실제로는 백엔드 결과를 사용해야 함)
      const isCorrect =
        problem.problem_type === 'multiple_choice'
          ? userAnswer === correctAnswer
          : userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

      return {
        problem_id: problem.id,
        user_answer: userAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        problem: problem,
      };
    });

    const correctCount = problemResults.filter((r) => r.is_correct).length;
    const totalProblems = problemResults.length;
    const score = Math.round((correctCount / totalProblems) * 100);

    return {
      session_id: Date.now().toString(),
      correct_count: correctCount,
      total_problems: totalProblems,
      score: score,
      problem_results: problemResults,
      graded_at: new Date().toISOString(),
    };
  }

  // 시험 결과 조회 (채점 기록에서 조회)
  static async getTestResult(gradingSessionId: string): Promise<any> {
    return apiRequest<any>(`/api/math-generation/grading-history/${gradingSessionId}`);
  }

  // 학생의 시험 기록 조회 (채점 기록 목록)
  static async getTestHistory(): Promise<any> {
    return apiRequest<any>('/api/math-generation/grading-history');
  }

  // ===== 과제 배포 관련 API =====

  // 과제 배포
  static async deployAssignment(data: {
    assignmentId: number;
    studentIds: number[];
    classroomId: number;
  }): Promise<any> {
    // 백엔드가 snake_case를 기대하므로 변환하고, assignmentId를 정수로 변환
    const requestData = {
      assignment_id: Math.floor(data.assignmentId), // 정수로 변환
      student_ids: data.studentIds,
      classroom_id: data.classroomId,
    };

    console.log('📤 Deploy Assignment - Original data:', data);
    console.log('📤 Deploy Assignment - Transformed data:', requestData);

    return apiRequest<any>('/api/math-generation/assignments/deploy', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // 학생용 과제 목록 조회
  static async getStudentAssignments(): Promise<any[]> {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const studentId = currentUser?.id;

      console.log('🔍 학생 과제 목록 조회 시작');
      console.log('현재 사용자 정보:', currentUser);
      console.log('학생 ID:', studentId);

      if (!studentId) {
        throw new Error('로그인이 필요합니다.');
      }

      const url = `/api/math-generation/assignments/student/${studentId}`;
      console.log('📡 요청 URL:', url);

      const result = await apiRequest<any[]>(url);
      console.log('✅ 과제 목록 조회 결과:', result);
      console.log('📊 조회된 과제 수:', result?.length || 0);

      return result || [];
    } catch (error: any) {
      console.error('❌ 학생 과제 목록 조회 오류:', error);
      console.error('❌ 에러 상세:', {
        message: error.message,
        status: error.status,
        stack: error.stack,
      });
      throw error;
    }
  }

  // 과제 상세 정보 조회 (학생용)
  static async getAssignmentDetail(assignmentId: number): Promise<any> {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
      const studentId = currentUser?.id;

      console.log('📚 과제 상세 조회 요청 시작');
      console.log('📚 학생 ID:', studentId, '과제 ID:', assignmentId);

      const url = `/api/math-generation/assignments/${assignmentId}/student/${studentId}`;
      console.log('📚 요청 URL:', url);

      if (!studentId) {
        throw new Error('로그인이 필요합니다.');
      }

      console.log('📚 API 요청 시작...');
      const result = await apiRequest<any>(url);
      console.log('✅ 과제 상세 조회 성공:', result);
      console.log('📊 문제 개수:', result?.problems?.length || 0);

      return result;
    } catch (error: any) {
      console.error('❌ 과제 상세 조회 오류:', error);
      console.error('❌ 에러 상세:', {
        message: error.message,
        status: error.status,
        stack: error.stack,
      });
      throw error;
    }
  }
}
