export interface AssignmentResult {
  id?: number;
  grading_session_id?: number;
  student_id: number;
  student_name: string;
  school: string;
  grade: string;
  status: string;
  total_score: number;
  max_possible_score: number;
  correct_count: number;
  total_problems: number;
  graded_at?: string;
  submitted_at?: string;
  graded_by?: string;
  problem_results?: any[];
}

export interface AnswerStatus {
  isCorrect: boolean;
  studentAnswer: string;
  correctAnswer: string;
  studentAnswerText: string;
  correctAnswerText: string;
  explanation?: string;
  aiFeedback?: string | null;
}

export type SubjectType = 'korean' | 'english' | 'math';
