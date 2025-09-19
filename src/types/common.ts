// 공통 타입 정의

export interface BaseWorksheet {
  id: number;
  title: string;
  school_level: string;
  grade: number;
  problem_count: number;
  status: string;
  created_at: string;
  user_prompt?: string;
  generation_id?: string;
}

export interface BaseProblem {
  id: number;
  sequence_order: number;
  difficulty: string;
  question: string;
  choices?: string[];
  correct_answer: string;
  explanation: string;
}

export interface BaseFormData {
  school_level: string;
  grade: number;
  semester: string;
  difficulty: string;
  problem_count: number;
  requirements?: string;
}

export interface BaseGenerationResponse {
  task_id: string;
  status: string;
  message: string;
}

export interface BaseWorksheetDetail {
  id: number;
  title: string;
  school_level: string;
  grade: number;
  problem_count: number;
  status: string;
  created_at: string;
  problems: BaseProblem[];
  user_prompt?: string;
  generation_id?: string;
}
