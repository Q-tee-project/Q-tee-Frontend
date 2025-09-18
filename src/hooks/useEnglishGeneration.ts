import { useState } from 'react';
import { useProblemGeneration, PreviewQuestion } from './useProblemGeneration';
import { EnglishService } from '@/services/englishService';
import { EnglishFormData, EnglishGenerationResponse, EnglishLLMResponseAndRequest, EnglishPassage, EnglishQuestion } from '@/types/english';
import {
  EnglishUIData,
  ParsedPassage,
  ParsedQuestion,
  ParsedPassageContent,
  ParsedContentItem,
  PassageMetadata
} from '@/types/englishUI';

// 데이터 변환 함수들
const transformPassageContent = (content: any): ParsedPassageContent => {
  return {
    metadata: content.metadata ? {
      sender: content.metadata.sender,
      recipient: content.metadata.recipient,
      subject: content.metadata.subject,
      date: content.metadata.date,
      participants: content.metadata.participants,
      rating: content.metadata.rating,
      productName: content.metadata.product_name,
      reviewer: content.metadata.reviewer,
    } : undefined,
    content: content.content?.map((item: any): ParsedContentItem => ({
      type: item.type,
      value: item.value,
      items: item.items,
      pairs: item.pairs,
      speaker: item.speaker,
      line: item.line,
    })) || []
  };
};

const transformPassage = (passage: EnglishPassage): ParsedPassage => {
  return {
    id: passage.passage_id,
    type: passage.passage_type,
    content: transformPassageContent(passage.passage_content),
    originalContent: transformPassageContent(passage.original_content),
    koreanTranslation: transformPassageContent(passage.korean_translation),
    relatedQuestionIds: passage.related_questions,
  };
};


const transformQuestion = (question: EnglishQuestion): ParsedQuestion => {
  return {
    id: question.question_id,
    questionText: question.question_text,
    type: question.question_type,
    subject: question.question_subject,
    difficulty: question.question_difficulty,
    detailType: question.question_detail_type,
    passageId: question.question_passage_id ?? undefined,
    exampleContent: question.example_content,
    exampleOriginalContent: question.example_original_content,
    exampleKoreanTranslation: question.example_korean_translation,
    choices: question.question_choices || [],
    correctAnswer: question.question_type === '객관식'
      ? parseInt(question.correct_answer) - 1  // 1-based → 0-based index
      : question.correct_answer,
    explanation: question.explanation,
    learningPoint: question.learning_point,
  };
};

const transformToUIData = (response: EnglishLLMResponseAndRequest): EnglishUIData => {
  return {
    worksheetInfo: {
      id: response.worksheet_id,
      teacherId: response.teacher_id,
      name: response.worksheet_name,
      date: response.worksheet_date,
      time: response.worksheet_time,
      duration: response.worksheet_duration,
      subject: response.worksheet_subject,
      level: response.worksheet_level,
      grade: response.worksheet_grade,
      totalQuestions: response.total_questions,
    },
    passages: response.passages?.map(transformPassage) || [],
    questions: response.questions?.map(transformQuestion) || [],
  };
};

export const useEnglishGeneration = () => {
  const {
    isGenerating,
    generationProgress,
    previewQuestions,
    regeneratingQuestionId,
    regenerationPrompt,
    showRegenerationInput,
    lastGenerationData,
    errorMessage,
    updateState,
    resetGeneration,
    clearError,
  } = useProblemGeneration();

  // UI 데이터 상태 추가
  const [uiData, setUiData] = useState<EnglishUIData | null>(null);

  // UI 데이터 리셋 함수
  const resetUIData = () => {
    setUiData(null);
  };

  // 실제 영어 문제 생성
  const generateEnglishProblems = async (formData: EnglishFormData) => {
    try {
      updateState({
        isGenerating: true,
        generationProgress: 0,
        previewQuestions: [],
        errorMessage: '',
      });

      // UI 데이터 초기화
      setUiData(null);

      // 실제 API 호출
      const response: EnglishGenerationResponse = await EnglishService.generateEnglishProblems(formData);

      // 원본 응답 데이터 저장
      updateState({
        lastGenerationData: response,
        generationProgress: 100
      });

      // LLM 응답이 있으면 UI 데이터로 변환
      if (response.llm_response) {
        const transformedData = transformToUIData(response.llm_response);
        setUiData(transformedData);
        console.log('변환된 UI 데이터:', transformedData);
      }

      console.log('영어 문제 생성 응답:', response);

      updateState({ isGenerating: false });
      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '문제 생성 중 오류가 발생했습니다.';
      updateState({
        isGenerating: false,
        errorMessage,
        generationProgress: 0
      });
      // 에러 시 UI 데이터도 초기화
      setUiData(null);
      throw error;
    }
  };


  return {
    isGenerating,
    generationProgress,
    previewQuestions,
    regeneratingQuestionId,
    regenerationPrompt,
    showRegenerationInput,
    lastGenerationData,
    errorMessage,
    uiData,
    generateEnglishProblems,
    updateState,
    resetGeneration,
    resetUIData,
    clearError,
  };
};
