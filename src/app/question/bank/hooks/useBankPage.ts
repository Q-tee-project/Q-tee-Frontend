'use client';

import { useState, useEffect } from 'react';
import { MathService } from '@/services/mathService';
import { KoreanService } from '@/services/koreanService';
import { EnglishService } from '@/services/englishService';
import { Worksheet, MathProblem, Subject } from '@/types/math';

export const useBankPage = () => {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null);
  const [worksheetProblems, setWorksheetProblems] = useState<MathProblem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('수학');
  const [showAnswerSheet, setShowAnswerSheet] = useState<boolean>(false);

  useEffect(() => {
    loadWorksheets();
  }, [selectedSubject]);

  const loadWorksheets = async () => {
    console.log('워크시트 로드 시작...');
    setIsLoading(true);
    try {
      let worksheetData: any[] = [];

      switch (selectedSubject) {
        case Subject.MATH:
        case '수학':
          worksheetData = await MathService.getMathWorksheets();
          break;
        case '국어':
          try {
            worksheetData = await KoreanService.getKoreanWorksheets();
          } catch (error: any) {
            console.error('Korean service error:', error);
            setError(`국어 워크시트를 불러올 수 없습니다: ${error.message}`);
            worksheetData = [];
          }
          break;
        case '영어':
          try {
            worksheetData = await EnglishService.getEnglishWorksheets();
          } catch (error: any) {
            console.error('English service error:', error);
            setError(`영어 워크시트를 불러올 수 없습니다: ${error.message}`);
            worksheetData = [];
          }
          break;
        default:
          setWorksheets([]);
          setSelectedWorksheet(null);
          setWorksheetProblems([]);
          return;
      }

      console.log('워크시트 데이터:', worksheetData);
      setWorksheets(worksheetData);
      if (worksheetData.length > 0) {
        setSelectedWorksheet(worksheetData[0]);
        await loadWorksheetProblems(worksheetData[0].id);
      }
    } catch (error: any) {
      console.error('워크시트 로드 실패:', error);
      setError(`워크시트 데이터를 불러올 수 없습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorksheetProblems = async (worksheetId: number) => {
    console.log('🔍 워크시트 문제 로드 시작, ID:', worksheetId, '과목:', selectedSubject);
    try {
      let worksheetDetail: any;

      switch (selectedSubject) {
        case Subject.MATH:
        case '수학':
          console.log('🔢 수학 워크시트 상세 조회 중...');
          worksheetDetail = await MathService.getMathWorksheetDetail(worksheetId);
          break;
        case '국어':
          console.log('📚 국어 워크시트 상세 조회 중...');
          worksheetDetail = await KoreanService.getKoreanWorksheetDetail(worksheetId);
          break;
        case '영어':
          console.log('🔤 영어 워크시트 상세 조회 중...');
          worksheetDetail = await EnglishService.getEnglishWorksheetDetail(worksheetId);
          break;
        default:
          return;
      }

      console.log('✅ 워크시트 상세 데이터:', worksheetDetail);
      console.log('📝 문제 개수:', worksheetDetail.problems?.length || 0);
      setWorksheetProblems(worksheetDetail.problems || []);
    } catch (error: any) {
      console.error('❌ 워크시트 문제 로드 실패:', error);
      setError('워크시트 문제를 불러올 수 없습니다.');
    }
  };

  const handleWorksheetSelect = async (worksheet: Worksheet) => {
    setSelectedWorksheet(worksheet);
    await loadWorksheetProblems(worksheet.id);
  };

  const handleDeleteWorksheet = async (worksheet: Worksheet, event: React.MouseEvent) => {
    event.stopPropagation();

    if (
      !confirm(`"${worksheet.title}" 워크시트를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)
    ) {
      return;
    }

    try {
      setIsLoading(true);

      switch (selectedSubject) {
        case Subject.MATH:
        case '수학':
          await MathService.deleteMathWorksheet(worksheet.id);
          break;
        case '국어':
          // Korean delete not implemented yet
          throw new Error('국어 워크시트 삭제 기능은 아직 구현되지 않았습니다.');
        case '영어':
          // English delete not implemented yet
          throw new Error('영어 워크시트 삭제 기능은 아직 구현되지 않았습니다.');
        default:
          throw new Error('지원하지 않는 과목입니다.');
      }

      if (selectedWorksheet?.id === worksheet.id) {
        setSelectedWorksheet(null);
        setWorksheetProblems([]);
      }

      await loadWorksheets();
      alert('워크시트가 삭제되었습니다.');
    } catch (error: any) {
      console.error('워크시트 삭제 실패:', error);
      alert(`삭제 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    worksheets,
    selectedWorksheet,
    worksheetProblems,
    isLoading,
    error,
    selectedSubject,
    showAnswerSheet,
    setSelectedSubject,
    setShowAnswerSheet,
    setError,
    loadWorksheets,
    handleWorksheetSelect,
    handleDeleteWorksheet,
  };
};