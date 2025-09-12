'use client';

import React from 'react';
import { Subject } from '@/types/math';
import { FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useBankPage } from './hooks/useBankPage';
import { useWorksheetEdit } from './hooks/useWorksheetEdit';
import { useDistribution } from './hooks/useDistribution';
import { WorksheetList } from './components/WorksheetList';
import { WorksheetDetail } from './components/WorksheetDetail';
import { ProblemEditDialog } from './components/ProblemEditDialog';
import { DistributionDialog } from './components/DistributionDialog';
import { ErrorToast } from './components/ErrorToast';
import { LoadingOverlay } from './components/LoadingOverlay';

export default function BankPage() {
  const {
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
  } = useBankPage();

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
  } = useWorksheetEdit();

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
    <div className="min-h-screen flex flex-col">
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
              onClick={() => setSelectedSubject(subject)}
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
            worksheets={worksheets}
            selectedWorksheet={selectedWorksheet}
            selectedSubject={selectedSubject}
            isLoading={isLoading}
            error={error}
            onWorksheetSelect={handleWorksheetSelect}
            onDeleteWorksheet={handleDeleteWorksheet}
            onRefresh={loadWorksheets}
          />

          <WorksheetDetail
            selectedWorksheet={selectedWorksheet}
            worksheetProblems={worksheetProblems}
            showAnswerSheet={showAnswerSheet}
            isEditingTitle={isEditingTitle}
            editedTitle={editedTitle}
            onToggleAnswerSheet={() => setShowAnswerSheet(!showAnswerSheet)}
            onOpenDistributeDialog={() => setIsDistributeDialogOpen(true)}
            onOpenEditDialog={() => setIsEditDialogOpen(true)}
            onEditProblem={handleEditProblem}
            onStartEditTitle={() => handleStartEditTitle(selectedWorksheet?.title || '')}
            onCancelEditTitle={handleCancelEditTitle}
            onSaveTitle={() =>
              selectedWorksheet && handleSaveTitle(selectedWorksheet.id, loadWorksheets)
            }
            onEditedTitleChange={setEditedTitle}
          />
        </div>
      </div>

      <ErrorToast error={error} onClose={() => setError(null)} />
      <LoadingOverlay isLoading={isLoading} />

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
            if (selectedWorksheet) {
              await loadWorksheets();
            }
          })
        }
      />
    </div>
  );
}
