'use client';

import React, { useState, useMemo } from 'react';
import { Subject } from '@/types/math';
import { FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMathBank } from '@/hooks/useMathBank';
import { useKoreanBank } from '@/hooks/useKoreanBank';
import { useEnglishBank } from '@/hooks/useEnglishBank';
import { useWorksheetEdit } from './hooks/useWorksheetEdit';
import { useDistribution } from './hooks/useDistribution';
import { WorksheetList } from './components/WorksheetList';
import { MathWorksheetDetail } from './components/MathWorksheetDetail';
import { KoreanWorksheetDetail } from './components/KoreanWorksheetDetail';
import { EnglishWorksheetDetail } from './components/EnglishWorksheetDetail';
import { ProblemEditDialog } from './components/ProblemEditDialog';
import { DistributionDialog } from './components/DistributionDialog';
import { ErrorToast } from './components/ErrorToast';
import { LoadingOverlay } from './components/LoadingOverlay';

// 과목별 컴포넌트 타입 정의 - 각 컴포넌트가 받는 실제 props에 맞춤
interface WorksheetDetailProps<T = any, P = any> {
  selectedWorksheet: T | null;
  worksheetProblems: P[];
  showAnswerSheet: boolean;
  isEditingTitle: boolean;
  editedTitle: string;
  onToggleAnswerSheet: () => void;
  onOpenDistributeDialog: () => void;
  onOpenEditDialog: () => void;
  onEditProblem: (problem: P) => void;
  onStartEditTitle: () => void;
  onCancelEditTitle: () => void;
  onSaveTitle: () => void;
  onEditedTitleChange: (value: string) => void;
}

type WorksheetDetailComponent = React.ComponentType<WorksheetDetailProps>;

export default function BankPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('국어');

  // 과목별 Bank 훅들
  const mathBank = useMathBank();
  const koreanBank = useKoreanBank();
  const englishBank = useEnglishBank();

  // 현재 선택된 과목에 따른 상태 매핑
  const currentBank = useMemo(() => {
    switch (selectedSubject) {
      case '수학': return mathBank;
      case '국어': return koreanBank;
      case '영어': return englishBank;
      default: return koreanBank;
    }
  }, [selectedSubject, mathBank, koreanBank, englishBank]);

  // 과목별 컴포넌트 매핑
  const WorksheetDetailComponents: Record<string, WorksheetDetailComponent> = useMemo(() => ({
    '수학': MathWorksheetDetail,
    '국어': KoreanWorksheetDetail,
    '영어': EnglishWorksheetDetail,
  }), []);

  const handleSubjectChange = (newSubject: string) => {
    setSelectedSubject(newSubject);
  };

  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    editFormData,
    autoConvertMode,
    setAutoConvertMode,
    isEditingTitle,
    editedTitle,
    setEditedTitle,
    handleEditProblem,
    handleSaveProblem,
    handleEditFormChange,
    handleChoiceChange,
    handleStartEditTitle,
    handleCancelEditTitle,
    handleSaveTitle,
  } = useWorksheetEdit(selectedSubject);

  const {
    isDistributeDialogOpen,
    setIsDistributeDialogOpen,
    selectedClasses,
    selectedRecipients,
    filteredRecipients,
    handleClassSelect,
    handleRecipientSelect,
    handleDistribute,
  } = useDistribution();

  return (
    <div className="flex flex-col" style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      {/* 헤더 영역 */}
      <PageHeader
        icon={<FileText />}
        title="문제 관리"
        variant="question"
        description="문제지 편집 및 배포할 수 있습니다"
      />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 min-h-0">
        <div className="flex gap-6 h-full">
          <WorksheetList
            worksheets={currentBank.worksheets}
            selectedWorksheet={currentBank.selectedWorksheet}
            selectedSubject={selectedSubject}
            isLoading={currentBank.isLoading}
            error={currentBank.error}
            onWorksheetSelect={currentBank.handleWorksheetSelect as (worksheet: any) => void}
            onDeleteWorksheet={currentBank.handleDeleteWorksheet as (worksheet: any, event: React.MouseEvent) => void}
            onBatchDeleteWorksheets={currentBank.handleBatchDeleteWorksheets as (worksheets: any[]) => void}
            onRefresh={currentBank.loadWorksheets}
            onSubjectChange={handleSubjectChange}
          />

          {(() => {
            const WorksheetDetailComponent = WorksheetDetailComponents[selectedSubject];
            if (!WorksheetDetailComponent) return null;

            return (
              <WorksheetDetailComponent
                selectedWorksheet={currentBank.selectedWorksheet}
                worksheetProblems={currentBank.worksheetProblems}
                showAnswerSheet={currentBank.showAnswerSheet}
                isEditingTitle={isEditingTitle}
                editedTitle={editedTitle}
                onToggleAnswerSheet={() => currentBank.setShowAnswerSheet(!currentBank.showAnswerSheet)}
                onOpenDistributeDialog={() => setIsDistributeDialogOpen(true)}
                onOpenEditDialog={() => setIsEditDialogOpen(true)}
                onEditProblem={handleEditProblem}
                onStartEditTitle={() =>
                  handleStartEditTitle(currentBank.selectedWorksheet?.title || '')
                }
                onCancelEditTitle={handleCancelEditTitle}
                onSaveTitle={() =>
                  currentBank.selectedWorksheet &&
                  handleSaveTitle(currentBank.selectedWorksheet.id, currentBank.loadWorksheets)
                }
                onEditedTitleChange={setEditedTitle}
              />
            );
          })()}
        </div>
      </div>

      <ErrorToast error={currentBank.error} onClose={() => currentBank.clearError()} />
      <LoadingOverlay isLoading={currentBank.isLoading} />

      <DistributionDialog
        isOpen={isDistributeDialogOpen}
        onOpenChange={setIsDistributeDialogOpen}
        selectedClasses={selectedClasses}
        selectedRecipients={selectedRecipients}
        filteredRecipients={filteredRecipients}
        onClassSelect={handleClassSelect}
        onRecipientSelect={handleRecipientSelect}
        onDistribute={handleDistribute}
      />

      <ProblemEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editFormData={editFormData}
        autoConvertMode={autoConvertMode}
        onAutoConvertModeChange={setAutoConvertMode}
        onFormChange={handleEditFormChange}
        onChoiceChange={handleChoiceChange}
        onSave={() =>
          handleSaveProblem(async () => {
            if (currentBank.selectedWorksheet) {
              await currentBank.loadWorksheets();
            }
          })
        }
      />
    </div>
  );
}
