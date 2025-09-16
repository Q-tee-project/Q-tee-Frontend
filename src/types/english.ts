// 영어 문제 관련 타입 정의

export interface EnglishWorksheet {
  id: number;
  title: string;
  school_level: string;
  grade: number;
  english_type: string;
  problem_count: number;
  status: string;
  created_at: string;
  user_prompt?: string;
  generation_id?: string;
}

export interface EnglishProblem {
  id: number;
  sequence_order: number;
  english_type: string;
  difficulty: string;
  question: string;
  choices?: string[];
  correct_answer: string;
  explanation: string;
  source_text?: string;
  source_title?: string;
  source_author?: string;
}

export interface EnglishFormData {
  school_level: string;
  grade: number;
  semester: string;
  english_type: string;
  english_sub_type?: string;
  english_ratios?: Record<string, number>;
  difficulty: string;
  difficulty_ratios?: Record<string, number>;
  requirements?: string;
  problem_count: number;
}

export interface EnglishGenerationResponse {
  task_id: string;
  status: string;
  message: string;
}

export interface EnglishWorksheetDetail {
  id: number;
  title: string;
  school_level: string;
  grade: number;
  english_type: string;
  problem_count: number;
  status: string;
  created_at: string;
  problems: EnglishProblem[];
  user_prompt?: string;
  generation_id?: string;
}
