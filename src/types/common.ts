// 공통 타입 정의

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
  problems: any[]; // Changed from BaseProblem[]
  user_prompt?: string;
  generation_id?: string;
}
