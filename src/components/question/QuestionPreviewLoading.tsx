import React from 'react';

interface QuestionPreviewLoadingProps {
  generationProgress: number;
}

export const QuestionPreviewLoading: React.FC<QuestionPreviewLoadingProps> = ({
  generationProgress,
}) => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-lg font-medium text-gray-700 mb-2">문제를 생성하고 있습니다...</div>
        <div className="w-64 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${generationProgress}%` }}
          ></div>
        </div>
        <div className="text-sm text-gray-500 mt-2">{Math.round(generationProgress)}% 완료</div>
      </div>
    </div>
  );
};
