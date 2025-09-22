// 영어 문제 관련 타입 정의

export interface EnglishWorksheet {
  id: number;
  title: string;
  school_level: string;
  grade: number;
  english_type: string;
  problem_type?: string;
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
  total_questions: number;
  subjects: string[];
  subject_details: {
    reading_types?: number[];
    grammar_categories?: number[];
    vocabulary_categories?: number[];
  };
  subject_ratios: { subject: string; ratio: number }[];
  question_format: string;
  format_ratios: { format: string; ratio: number }[];
  difficulty_distribution: { difficulty: string; ratio: number }[];
  additional_requirements?: string;
}

export interface EnglishGenerationResponse {
  message: string;
  status: 'success' | 'error';
  llm_response?: EnglishLLMResponseAndRequest;
  llm_error?: string;
}

export interface EnglishWorksheetDetail {
  id: number;
  title: string;
  school_level: string;
  grade: number;
  english_type: string;
  problem_type?: string;
  problem_count: number;
  status: string;
  created_at: string;
  problems: EnglishProblem[];
  user_prompt?: string;
  generation_id?: string;
  worksheet_data?: EnglishLLMResponseAndRequest;
}

export interface EnglishCategories {
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

export interface EnglishLLMResponseAndRequest {
  worksheet_id: string;
  teacher_id?: number;
  worksheet_name: string;
  worksheet_date: string;
  worksheet_time: string;
  worksheet_duration: string;
  worksheet_subject: string;
  worksheet_level: string;
  worksheet_grade: number;
  problem_type?: string;
  total_questions: number;
  passages: EnglishPassage[];
  questions: EnglishQuestion[];
}

export interface EnglishWorksheet {
  worksheet_id: string;
  worksheet_name: string;
  worksheet_date: string;
  worksheet_time: string;
  worksheet_duration: string;
  worksheet_subject: string;
  worksheet_level: string;
  worksheet_grade: number;
  problem_type?: string;
  total_questions: number;
  passages: EnglishPassage[];
  questions: EnglishQuestion[];
}

export interface EnglishPassage {
  passage_id: number;
  passage_type: 'article' | 'correspondence' | 'dialogue' | 'informational' | 'review';
  passage_content: EnglishPassageContent;
  original_content: EnglishPassageContent;
  korean_translation: EnglishPassageContent;
  related_questions: number[];
}

export interface EnglishPassageContent {
  metadata?: {
    sender?: string;
    recipient?: string;
    subject?: string;
    date?: string;
    participants?: string[];
    rating?: number;
    product_name?: string;
    reviewer?: string;
  };
  content: EnglishContentItem[];
}

export interface EnglishContentItem {
  type: 'title' | 'paragraph' | 'list' | 'key_value';
  value?: string;
  items?: string[];
  pairs?: { key: string; value: string }[];
  speaker?: string;
  line?: string;
}

export interface EnglishQuestion {
  question_id: number;
  question_text: string;
  question_type: '객관식' | '주관식';
  question_subject: string;
  question_difficulty: '상' | '중' | '하';
  question_detail_type: string;
  question_passage_id: number | null;
  example_content: string;
  example_original_content: string;
  example_korean_translation: string;
  question_choices: string[];
  correct_answer: string;
  explanation: string;
  learning_point: string;
}

// 문제 재생성 관련 타입 정의
export interface EnglishRegenerationInfo {
  question: {
    id: number;
    question_type: string;
    question_subject: string;
    question_detail_type: string;
    question_difficulty: string;
    passage_id?: number;
  };
  worksheet: {
    school_level: string;
    grade: number;
    problem_type: string;
  };
  has_passage: boolean;
  related_questions: {
    id: number;
    text: string;
  }[];
}

export interface EnglishRegenerationRequest {
  feedback: string;
  keep_passage?: boolean;
  keep_question_type?: boolean;
  keep_difficulty?: boolean;
  keep_subject?: boolean;
  keep_detail_type?: boolean;
  target_difficulty?: string;
  target_subject?: string;
  target_detail_type?: string;
  worksheet_context: {
    school_level: string;
    grade: number;
    worksheet_type: string;
  };
  current_question_type: string;
  current_subject: string;
  current_detail_type: string;
  current_difficulty: string;
  additional_requirements?: string;
}

export interface EnglishRegenerationResponse {
  status: 'success' | 'error';
  message: string;
  regenerated_question?: EnglishQuestion;
  regenerated_passage?: EnglishPassage;
  error_details?: string;
}
