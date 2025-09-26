'use client';

import React, { useState, useMemo } from 'react';
import { FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMathBank } from '@/hooks/useMathBank';
import { useKoreanBank } from '@/hooks/useKoreanBank';
import { useEnglishBank } from '@/hooks/useEnglishBank';
import { useWorksheetEdit } from '@/hooks/bank/useWorksheetEdit';
import { useDistribution } from '@/hooks/bank/useDistribution';
import { WorksheetList } from '@/components/bank/WorksheetList';
import { MathWorksheetDetail } from '@/components/bank/MathWorksheetDetail';
import { KoreanWorksheetDetail } from '@/components/bank/KoreanWorksheetDetail';
import { EnglishWorksheetDetail } from '@/components/bank/EnglishWorksheetDetail';
import { MathProblemEditDialog } from '@/components/bank/MathProblemEditDialog';
import { KoreanProblemEditDialog } from '@/components/bank/KoreanProblemEditDialog';
import { EnglishProblemEditDialog } from '@/components/bank/EnglishProblemEditDialog';
import { DistributionDialog } from '@/components/bank/DistributionDialog';
import { ErrorToast } from '@/components/bank/ErrorToast';
import { LoadingOverlay } from '@/components/bank/LoadingOverlay';

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
  onRefresh?: () => void;
  worksheetPassages?: any[];
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
      case '수학':
        return mathBank;
      case '국어':
        return koreanBank;
      case '영어':
        return englishBank;
      default:
        return koreanBank;
    }
  }, [selectedSubject, mathBank, koreanBank, englishBank]);

  // 과목별 컴포넌트 매핑
  const WorksheetDetailComponents: Record<string, WorksheetDetailComponent> = useMemo(
    () => ({
      수학: MathWorksheetDetail as unknown as WorksheetDetailComponent,
      국어: KoreanWorksheetDetail as unknown as WorksheetDetailComponent,
      영어: EnglishWorksheetDetail as unknown as WorksheetDetailComponent,
    }),
    [],
  );

  const handleSubjectChange = (newSubject: string) => {
    setSelectedSubject(newSubject);
  };

  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    editFormData,
    isEditingTitle,
    editedTitle,
    isRegenerating,
    handleEditProblem,
    handleSaveProblem,
    handleEditFormChange,
    handleChoiceChange,
    handleStartEditTitle,
    handleCancelEditTitle,
    handleSaveTitle,
    handleEditedTitleChange,
    handleRegenerateProblem,
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
    <div className="flex flex-col p-5 gap-5">
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
            worksheets={currentBank.worksheets as any[]}
            selectedWorksheet={currentBank.selectedWorksheet as any}
            selectedSubject={selectedSubject}
            isLoading={currentBank.isLoading}
            error={currentBank.error}
            onWorksheetSelect={currentBank.handleWorksheetSelect as (worksheet: any) => void}
            onDeleteWorksheet={
              currentBank.handleDeleteWorksheet as (worksheet: any, event: React.MouseEvent) => void
            }
            onBatchDeleteWorksheets={
              currentBank.handleBatchDeleteWorksheets as (worksheets: any[]) => void
            }
            onRefresh={currentBank.loadWorksheets}
            onSubjectChange={handleSubjectChange}
          />

          {(() => {
            const WorksheetDetailComponent = WorksheetDetailComponents[selectedSubject];
            if (!WorksheetDetailComponent) return null;

            return (
              <WorksheetDetailComponent
                selectedWorksheet={currentBank.selectedWorksheet as any}
                worksheetProblems={currentBank.worksheetProblems as any[]}
                showAnswerSheet={currentBank.showAnswerSheet}
                isEditingTitle={isEditingTitle}
                editedTitle={editedTitle}
                onToggleAnswerSheet={() =>
                  currentBank.setShowAnswerSheet(!currentBank.showAnswerSheet)
                }
                onOpenDistributeDialog={() => setIsDistributeDialogOpen(true)}
                onOpenEditDialog={() => setIsEditDialogOpen(true)}
                onEditProblem={handleEditProblem}
                onStartEditTitle={() => {
                  const currentTitle = selectedSubject === '영어'
                    ? (currentBank.selectedWorksheet as any)?.worksheet_name || ''
                    : (currentBank.selectedWorksheet as any)?.title || '';
                  handleStartEditTitle(currentTitle);
                }}
                onCancelEditTitle={handleCancelEditTitle}
                onSaveTitle={() => {
                  if (currentBank.selectedWorksheet) {
                    const worksheetId = selectedSubject === '영어'
                      ? (currentBank.selectedWorksheet as any).worksheet_id
                      : (currentBank.selectedWorksheet as any).id;
                    handleSaveTitle(worksheetId, currentBank.loadWorksheets);
                  }
                }}
                onEditedTitleChange={handleEditedTitleChange}
                onRefresh={() => {
                  if (currentBank.selectedWorksheet) {
                    const worksheetId = (currentBank.selectedWorksheet as any).worksheet_id || (currentBank.selectedWorksheet as any).id;
                    if (worksheetId) {
                      currentBank.handleWorksheetSelect(currentBank.selectedWorksheet as any);
                    }
                  }
                }}
                worksheetPassages={(currentBank as any).worksheetPassages}
              />
            );
          })()}
        </div>
      </div>

      <ErrorToast error={currentBank.error} onClose={() => currentBank.clearError()} />
      <LoadingOverlay isLoading={currentBank.isLoading} />
      <LoadingOverlay isLoading={isRegenerating} message="문제를 재생성하고 있습니다... 🔄" />

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

      {selectedSubject === '수학' ? (
        <MathProblemEditDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          editFormData={editFormData}
          onFormChange={handleEditFormChange}
          onChoiceChange={handleChoiceChange}
          onSave={() =>
            handleSaveProblem(async () => {
              if (currentBank.selectedWorksheet) {
                await currentBank.loadWorksheets();
              }
            })
          }
          onRegenerate={(requirements) => {
            handleRegenerateProblem(requirements);
          }}
        />
      ) : selectedSubject === '국어' ? (
        <KoreanProblemEditDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          editFormData={editFormData}
          onFormChange={handleEditFormChange}
          onChoiceChange={handleChoiceChange}
          onSave={() =>
            handleSaveProblem(async () => {
              if (currentBank.selectedWorksheet) {
                await currentBank.loadWorksheets();
              }
            })
          }
          onRegenerate={(requirements) => {
            handleRegenerateProblem(requirements);
          }}
        />
      ) : selectedSubject === '영어' ? (
        <EnglishProblemEditDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          editFormData={editFormData}
          onFormChange={handleEditFormChange}
          onChoiceChange={handleChoiceChange}
          onSave={() =>
            handleSaveProblem(async () => {
              if (currentBank.selectedWorksheet) {
                await currentBank.loadWorksheets();
              }
            })
          }
          onRegenerate={(requirements) => {
            handleRegenerateProblem(requirements);
          }}
        />
      ) : null}
    </div>
  );
}
