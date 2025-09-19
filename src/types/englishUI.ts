// 영어 문제 UI 렌더링용 타입 정의

// 파싱된 지문 데이터 (UI 렌더링용)
export interface ParsedPassage {
  id: number;
  type: 'article' | 'correspondence' | 'dialogue' | 'informational' | 'review';
  content: ParsedPassageContent;
  originalContent: ParsedPassageContent;
  koreanTranslation: ParsedPassageContent;
  relatedQuestionIds: number[];
}

// 파싱된 지문 내용 (UI 렌더링용)
export interface ParsedPassageContent {
  metadata?: PassageMetadata;
  content: ParsedContentItem[];
}

// 파싱된 콘텐츠 아이템 (UI 렌더링용)
export interface ParsedContentItem {
  type: 'title' | 'paragraph' | 'list' | 'key_value';
  value?: string;
  items?: string[];
  pairs?: { key: string; value: string }[];
  speaker?: string;  // dialogue용
  line?: string;     // dialogue용
}

// 지문 메타데이터 (UI 표시용)
export interface PassageMetadata {
  sender?: string;
  recipient?: string;
  subject?: string;
  date?: string;
  participants?: string[];
  rating?: number;
  productName?: string;
  reviewer?: string;
}

// 파싱된 예문 데이터 (UI 렌더링용)
export interface ParsedExample {
  id: number;
  content: string;
  originalContent: string;
  koreanTranslation: string;
  relatedQuestionId: number;
}

// 파싱된 문제 데이터 (UI 렌더링용)
export interface ParsedQuestion {
  id: number;
  questionText: string;
  type: '객관식' | '주관식';
  subject: string;
  difficulty: '상' | '중' | '하';
  detailType: string;
  passageId?: number;
  exampleContent?: string;
  exampleOriginalContent?: string;
  exampleKoreanTranslation?: string;
  choices: string[];
  correctAnswer: string | number; // 객관식: 인덱스, 주관식: 텍스트
  explanation: string;
  learningPoint: string;
}

// 영어 문제 전체 UI 데이터
export interface EnglishUIData {
  worksheetInfo: {
    id: string;                    // worksheet_id → id
    teacherId?: number;            // teacher_id → teacherId
    name: string;                  // worksheet_name → name
    date: string;                  // worksheet_date → date
    time: string;                  // worksheet_time → time
    duration: string;              // worksheet_duration → duration
    subject: string;               // worksheet_subject → subject
    level: string;                 // worksheet_level → level
    grade: number;                 // worksheet_grade → grade
    problemType?: string;          // problem_type → problemType
    totalQuestions: number;        // total_questions → totalQuestions
  };
  passages: ParsedPassage[];
  questions: ParsedQuestion[];
}

// 영어 문제 미리보기 컴포넌트 Props
export interface EnglishQuestionPreviewProps {
  uiData?: EnglishUIData;
  isGenerating: boolean;
  generationProgress: number;
  worksheetName: string;
  setWorksheetName: (name: string) => void;
  regeneratingQuestionId: number | null;
  regenerationPrompt: string;
  setRegenerationPrompt: (prompt: string) => void;
  showRegenerationInput: number | null;
  setShowRegenerationInput: (id: number | null) => void;
  onRegenerateQuestion: (questionId: number, prompt?: string) => void;
  onSaveWorksheet: () => void;
  isSaving: boolean;
}

// 지문 렌더링용 컴포넌트 Props
export interface PassageDisplayProps {
  passage: ParsedPassage;
  showTranslation?: boolean;
  showOriginal?: boolean;
}

// 문제 렌더링용 컴포넌트 Props
export interface QuestionDisplayProps {
  question: ParsedQuestion;
  showAnswer?: boolean;
  showExplanation?: boolean;
  onRegenerate?: (questionId: number, prompt?: string) => void;
  isRegenerating?: boolean;
}