'use client';

import React, { useState, useEffect } from 'react';
import { Subject } from '@/types/math';
import { FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMathBank } from '@/hooks/useMathBank';
import { useKoreanBank } from '@/hooks/useKoreanBank';
import { useEnglishBank } from '@/hooks/useEnglishBank';
import { useWorksheetEdit } from './hooks/useWorksheetEdit';
import { useDistribution } from './hooks/useDistribution';
import { WorksheetList } from './components/WorksheetList';
import { WorksheetDetail } from './components/WorksheetDetail';
import { ProblemEditDialog } from './components/ProblemEditDialog';
import { DistributionDialog } from './components/DistributionDialog';
import { ErrorToast } from './components/ErrorToast';
import { LoadingOverlay } from './components/LoadingOverlay';

export default function BankPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('국어');

  // 과목별 Bank 훅들
  const mathBank = useMathBank();
  const koreanBank = useKoreanBank();
  const englishBank = useEnglishBank();

  // 현재 선택된 과목에 따른 상태
  const currentBank =
    selectedSubject === '수학' ? mathBank : selectedSubject === '국어' ? koreanBank : englishBank;

  // 각 Bank 훅에서 자동으로 데이터를 로드하므로 별도의 useEffect 불필요

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
    <div className="flex flex-col">
      {/* 헤더 영역 */}
      <PageHeader
        icon={<FileText />}
        title="문제 관리"
        variant="question"
        description="문제지 편집 및 배포할 수 있습니다"
      />

      {/* 과목 탭 */}
      <div className="px-6 pb-2 flex-shrink-0">
        <nav className="flex space-x-8">
          {[Subject.KOREAN, Subject.ENGLISH, Subject.MATH].map((subject) => (
            <button
              key={subject}
              onClick={() => handleSubjectChange(subject)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedSubject === subject
                  ? 'border-[#0072CE] text-[#0072CE]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {subject}
            </button>
          ))}
        </nav>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 p-4 min-h-0">
        <div className="flex gap-4 h-full">
          <WorksheetList
            worksheets={currentBank.worksheets}
            selectedWorksheet={currentBank.selectedWorksheet}
            selectedSubject={selectedSubject}
            isLoading={currentBank.isLoading}
            error={currentBank.error}
            onWorksheetSelect={currentBank.handleWorksheetSelect as any}
            onDeleteWorksheet={currentBank.handleDeleteWorksheet as any}
            onBatchDeleteWorksheets={currentBank.handleBatchDeleteWorksheets as any}
            onRefresh={currentBank.loadWorksheets}
          />

          <WorksheetDetail
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
