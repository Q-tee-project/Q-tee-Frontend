// 수학 문제 관련 타입 정의

export interface Worksheet {
  id: number;
  title: string;
  school_level: string;
  grade: number;
  semester: number;
  unit_name: string;
  chapter_name: string;
  problem_count: number;
  status: string;
  created_at: string;
  difficulty_ratio?: string;
  problem_type_ratio?: string;
  user_prompt?: string;
  actual_difficulty_distribution?: string;
  actual_type_distribution?: string;
  generation_id?: string;
}

export interface MathProblem {
  id: number;
  sequence_order: number;
  problem_type: string;
  difficulty: string;
  question: string;
  choices?: string[];
  correct_answer: string;
  explanation: string;
  latex_content?: string;
  has_diagram?: boolean;
  diagram_type?: string;
  diagram_elements?: any;
}

export interface MathFormData {
  school_level: string;
  grade: number;
  semester: number;
  unit_name: string;
  chapter_name: string;
  problem_count: number;
  difficulty_ratio: { A: number; B: number; C: number };
  problem_type_ratio: { 객관식: number; 단답형: number; 서술형: number };
  user_text?: string;
}

// 교육과정 관련 타입
export interface CurriculumStructure {
  school_level: string;
  grade: number;
  semester: number;
  units: Unit[];
}

export interface Unit {
  id: number;
  name: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: number;
  name: string;
  unit_id: number;
}

// 문제 생성 결과 타입
export interface GenerationResult {
  task_id: string;
  status: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE';
  message: string;
  result?: {
    generation_id: string;
    worksheet_id: number;
    problems: MathProblem[];
  };
}

// 태스크 상태 타입
export interface TaskStatus {
  task_id: string;
  status: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE';
  current?: number;
  total?: number;
  message?: string;
  result?: any;
  error?: string;
}

// 문제 유형 enum
export enum ProblemType {
  MULTIPLE_CHOICE = 'multiple_choice',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay'
}

// 난이도 enum
export enum Difficulty {
  A = 'A',  // 상
  B = 'B',  // 중
  C = 'C'   // 하
}

// 학교급 enum
export enum SchoolLevel {
  ELEMENTARY = '초등학교',
  MIDDLE = '중학교',
  HIGH = '고등학교'
}

// 과목 enum
export enum Subject {
  KOREAN = '국어',
  MATH = '수학',
  ENGLISH = '영어'
}

// 유틸리티 함수 타입
export type ProblemTypeConverter = (type: string) => string;
export type DifficultyConverter = (difficulty: string) => string;