// 영어 문제 생성 관련 타입 정의
export interface EnglishWorksheetGeneratorFormData {
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

// 영어 문제 생성 관련 타입 정의 끝

// 영어 문제 생성 응답 타입 정의
export interface EnglishGenerationResponse {
  message: string;
  status: 'success' | 'error';
  llm_response?: EnglishWorksheetData;
  llm_error?: string;
}

// 비동기 처리 관련 타입 추가
export interface EnglishAsyncResponse {
  task_id: string;
  status: 'started';
  message: string;
}

export interface EnglishTaskStatus {
  task_id: string;
  state: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE';
  status: string;
  current: number;
  total: number;
  result?: EnglishGenerationResponse;  // SUCCESS일 때 기존 응답 포함
  error?: string;
}

// 영어 워크시트 데이터 타입 정의
export interface EnglishWorksheetData {
  worksheet_id?: number;
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
  passages?: EnglishPassage[]; // 지문 데이터
  questions?: EnglishQuestion[]; // 문제 데이터
}

// 영어 워크시트 상세 응답 타입 정의
export interface EnglishWorksheetDetailResponse {
  status: string;
  message: string;
  worksheet_data: EnglishWorksheetData;
}

// 영어 지문 데이터 타입 정의
export interface EnglishPassage {
  passage_id: number;
  passage_type: 'article' | 'correspondence' | 'dialogue' | 'informational' | 'review';
  passage_content: EnglishPassageContent;
  original_content: EnglishPassageContent;
  korean_translation: EnglishPassageContent;
  related_questions: number[];
}

// 영어 지문 콘텐츠 타입 정의 - 실제 백엔드 데이터 구조에 맞춤
export interface EnglishPassageContent {
  // 현재 백엔드에서 반환하는 구조 (우선순위)
  title?: string;
  paragraphs?: string[];

  // 메타데이터 (편지, 리뷰 등에서 사용)
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

  // 레거시 구조화된 형식 (하위 호환성)
  content?: EnglishContentItem[];
}

// 영어 지문 콘텐츠 아이템 타입 정의
export interface EnglishContentItem {
  type: 'title' | 'paragraph' | 'list' | 'key_value';
  value?: string;
  items?: string[];
  pairs?: { key: string; value: string }[];
  speaker?: string;
  line?: string;
}

// 영어 문제 데이터 타입 정의
export interface EnglishQuestion {
  question_id: number;
  question_text: string;
  question_type: '객관식' | '단답형' | '서술형';
  question_subject: string;
  question_difficulty: '상' | '중' | '하';
  question_detail_type: string;
  question_passage_id: number | null;
  example_content: string;
  example_original_content: string;
  example_korean_translation: string;
  question_choices: string[];
  correct_answer: string | number;
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
  related_questions?: {
    id: number;
    text: string;
  }[];
}

// 영어 문제 재생성 요청 데이터
export interface EnglishRegenerationRequest {
  feedback: string; // 사용자 피드백 (필수)
  worksheet_context: {
    school_level: string; // 학교급
    grade: number; // 학년
  };
}

export interface EnglishRegenerationResponse {
  status: 'success' | 'error';
  message: string;
  regenerated_passage?: EnglishPassage | null;   // 지문이 있으면 항상 포함
  regenerated_questions?: EnglishQuestion[] | null; // 모든 재생성된 문제를 담는 통합 배열
  warnings?: string[] | null;
  failed_questions?: any[] | null;
  error_details?: string;
}

// 데이터 기반 재생성 요청을 위한 새로운 타입
export interface EnglishDataRegenerationRequest {
  questions_data: EnglishQuestion[]; // 기본 문제와 연관 문제를 모두 포함하는 배열
  passage_data?: EnglishPassage;
  regeneration_request: EnglishRegenerationRequest;
}

// 영어 문제 재생성 비동기 응답 타입
export interface EnglishRegenerationAsyncResponse {
  task_id: string;
  status: 'started';
  message: string;
}

// 영어 재생성 작업 상태 타입
export interface EnglishRegenerationTaskStatus {
  task_id: string;
  state: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE';
  status: string;
  current: number;
  total: number;
  result?: EnglishRegenerationResponse;  // SUCCESS일 때 재생성 결과 포함
  error?: string;
}
