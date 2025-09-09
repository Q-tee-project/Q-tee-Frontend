// API 응답 타입 정의
export interface Question {
  id: number;
  type: string;
  difficulty: string;
  title: string;
  date: string;
  subject: string;
  questionText?: string;
  choices?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface Categories {
  reading_types: ReadingType[];
  grammar_categories: GrammarCategory[];
  vocabulary_categories: VocabularyCategory[];
}

export interface ReadingType {
  id: number;
  name: string;
  description?: string;
}

export interface GrammarCategory {
  id: number;
  name: string;
  topics: GrammarTopic[];
}

export interface GrammarTopic {
  id: number;
  name: string;
}

export interface VocabularyCategory {
  id: number;
  name: string;
}

// 문제 생성 요청 데이터 타입
export interface QuestionFormData {
  school_level: string;
  grade: number;
  total_questions: number;
  subjects: string[];
  subject_details: {
    reading_types?: string[];
    grammar_categories?: string[];
    grammar_topics?: string[];
    vocabulary_categories?: string[];
  };
  subject_ratios: { subject: string; ratio: number }[];
  question_format: string;
  format_ratios: { format: string; ratio: number }[];
  difficulty_distribution: { difficulty: string; ratio: number }[];
  additional_requirements?: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface QuestionGenerationResponse {
  message: string;
  status: 'success' | 'error';
  request_data: QuestionFormData;
  distribution_summary?: {
    total_questions: number;
    validation_passed: boolean;
    subject_distribution: { subject: string; count: number; ratio: number }[];
    format_distribution: { format: string; count: number; ratio: number }[];
    difficulty_distribution: { difficulty: string; count: number; ratio: number }[];
  };
  prompt?: string;
  llm_response?: string;
  llm_error?: string;
  subject_types_validation?: {
    reading_types: string[];
    grammar_categories: string[];
    grammar_topics: string[];
    vocabulary_categories: string[];
  };
}