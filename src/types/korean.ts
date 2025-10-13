// 국어 문제 관련 타입 정의

export interface KoreanWorksheet {
  id: number;
  title: string;
  school_level: string;
  grade: number;
  korean_type: string;
  problem_count: number;
  status: string;
  created_at: string;
  deployed_at?: string;
  unit_name: string;
  chapter_name: string;
  subject: string;
  user_prompt?: string;
  generation_id?: string;
}

export interface KoreanProblem {
  id: number;
  sequence_order: number;
  korean_type: string;
  question_type: string;  // 항상 '객관식'
  difficulty: string;
  question: string;
  choices: string[] | null;  // 필수 - 모든 문제가 객관식
  correct_answer: string;
  explanation: string;
  source_text?: string;
  source_title?: string;
  source_author?: string;
}

export interface KoreanFormData {
  school_level: string;
  grade: number;
  korean_type: string;
  problem_count: number;
  user_text?: string;
}

// 국어 문제 유형 enum
export enum KoreanType {
  POEM = '시',
  NOVEL = '소설',
  NON_FICTION = '수필/비문학',
  GRAMMAR = '문법'
}

// 국어 문제 생성 결과 타입
export interface KoreanGenerationResult {
  task_id: string;
  status: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE';
  message: string;
  result?: {
    generation_id: string;
    worksheet_id: number;
    problems: KoreanProblem[];
  };
}

// 국어 문제 생성 요청 타입
export interface KoreanGenerationRequest {
  school_level: string;
  grade: number;
  korean_type: string;
  problem_count?: number;
  user_text?: string;
}

// 국어 문제 생성 응답 타입
export interface KoreanGenerationResponse {
  message: string;
  status: 'success' | 'error';
  task_id: string;
  request_data: KoreanGenerationRequest;
}

// 학생용 과제 응답 타입
export interface StudentAssignmentResponse {
  id: number;
  title: string;
  korean_type: string;
  question_type: string;
  problem_count: number;
  status: string;
  deployed_at: string;
  assignment_id: number;
  classroom_id: number;
}