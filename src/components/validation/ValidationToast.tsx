'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, XCircle, TrendingUp, Clock } from 'lucide-react';

export interface ProblemValidationDetail {
  problemIndex: number;
  question: string;
  correct_answer: string;
  explanation: string;
  validation_result: {
    answer_accuracy: 'correct' | 'incorrect' | 'unclear';
    explanation_quality: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    math_correctness: 'consistent' | 'inconsistent' | 'unclear';
    overall_score: number;
    issues: string[];
    suggestions: string[];
  };
}

export interface ValidationSummary {
  total_problems: number;
  valid_problems: number;
  invalid_problems: number;
  auto_approved: number;
  manual_review_needed: number;
  validity_rate: number;
  auto_approval_rate: number;
  common_issues?: { [key: string]: number };
  problem_details?: ProblemValidationDetail[];
}

interface ValidationToastProps {
  summary: ValidationSummary | null;
  isVisible: boolean;
  onClose: () => void;
  autoCloseMs?: number;
}

export function ValidationToast({
  summary,
  isVisible,
  onClose,
  autoCloseMs = 8000
}: ValidationToastProps) {
  const [progress, setProgress] = useState(100);
  const [showDetailReport, setShowDetailReport] = useState(false);

  useEffect(() => {
    if (!isVisible || !autoCloseMs) return;

    const interval = 50; // 50ms마다 업데이트
    const step = (interval / autoCloseMs) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - step;
        if (newProgress <= 0) {
          onClose();
          return 100;
        }
        return newProgress;
      });
    }, interval);

    // 자동 닫기 타이머
    const autoCloseTimer = setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => {
      clearInterval(timer);
      clearTimeout(autoCloseTimer);
    };
  }, [isVisible, autoCloseMs, onClose]);

  useEffect(() => {
    if (isVisible) {
      setProgress(100);
    }
  }, [isVisible]);

  if (!isVisible || !summary) return null;

  // 검증 결과에 따른 아이콘과 색상 결정
  const getStatusConfig = () => {
    const { validity_rate, auto_approval_rate } = summary;

    if (validity_rate >= 90 && auto_approval_rate >= 80) {
      return {
        icon: <CheckCircle className="w-6 h-6" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        titleColor: 'text-green-800',
        progressColor: 'bg-green-500'
      };
    } else if (validity_rate >= 70 && auto_approval_rate >= 50) {
      return {
        icon: <AlertCircle className="w-6 h-6" />,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        titleColor: 'text-yellow-800',
        progressColor: 'bg-yellow-500'
      };
    } else {
      return {
        icon: <XCircle className="w-6 h-6" />,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        titleColor: 'text-red-800',
        progressColor: 'bg-red-500'
      };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div
        className={`
          max-w-sm w-full
          ${statusConfig.bgColor} ${statusConfig.borderColor}
          border-2 rounded-xl shadow-2xl
          p-5
          relative overflow-hidden
          backdrop-blur-sm
        `}
      >
        {/* 프로그레스 바 */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
          <div
            className={`h-full ${statusConfig.progressColor} transition-all duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={statusConfig.iconColor}>
              {statusConfig.icon}
            </div>
            <h3 className={`font-semibold text-sm ${statusConfig.titleColor}`}>
              AI 검증 완료
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 메인 통계 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">총 문제</p>
                <p className="text-lg font-bold text-gray-900">{summary.total_problems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">유효율</p>
                <p className="text-lg font-bold text-green-600">{summary.validity_rate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </div>

        {/* 세부 정보 */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">✅ 자동 승인</span>
            <span className="font-semibold text-green-600">{summary.auto_approved}개</span>
          </div>

          {summary.manual_review_needed > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                수동 검토 필요
              </span>
              <span className="font-semibold text-orange-600">{summary.manual_review_needed}개</span>
            </div>
          )}

          {summary.invalid_problems > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">❌ 검증 실패</span>
              <span className="font-semibold text-red-600">{summary.invalid_problems}개</span>
            </div>
          )}
        </div>

        {/* 자주 발견되는 문제점 */}
        {summary.common_issues && Object.keys(summary.common_issues).length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">주요 검증 이슈:</p>
            <div className="space-y-1">
              {Object.entries(summary.common_issues)
                .slice(0, 2) // 상위 2개만 표시
                .map(([issue, count]) => (
                  <div key={issue} className="text-xs text-gray-600">
                    • {issue} ({count}회)
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 행동 버튼 */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              className="flex-1 bg-gray-600 text-white text-xs py-2 px-3 rounded-md hover:bg-gray-700 transition-colors"
              onClick={() => setShowDetailReport(true)}
            >
              상세 리포트 보기
            </button>
            {summary.manual_review_needed > 0 ? (
              <button
                className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => {
                  // TODO: 검토 대기 문제들 페이지로 이동
                  console.log('검토 대기 문제들 확인');
                }}
              >
                검토 대기 확인
              </button>
            ) : (
              <button
                className="flex-1 bg-green-600 text-white text-xs py-2 px-3 rounded-md hover:bg-green-700 transition-colors"
                onClick={onClose}
              >
                모든 문제 사용 가능
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 상세 검증 리포트 모달 */}
      {showDetailReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* 배경 오버레이 */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowDetailReport(false)}
          />

          {/* 모달 컨텐츠 */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">📊 문제별 검증 상세 리포트</h2>
              <button
                onClick={() => setShowDetailReport(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 모달 바디 */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {summary.problem_details && summary.problem_details.length > 0 ? (
                <div className="space-y-6">
                  {summary.problem_details.map((detail) => (
                    <div key={detail.problemIndex} className="border border-gray-200 rounded-lg p-4">
                      {/* 문제 헤더 */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg text-gray-900">
                          문제 {detail.problemIndex}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            detail.validation_result.overall_score >= 80
                              ? 'bg-green-100 text-green-800'
                              : detail.validation_result.overall_score >= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            점수: {detail.validation_result.overall_score}/100
                          </span>
                        </div>
                      </div>

                      {/* 문제 내용 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">문제</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                            {detail.question}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">정답</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                            {detail.correct_answer}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">해설</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          {detail.explanation}
                        </p>
                      </div>

                      {/* 검증 결과 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <h5 className="font-medium text-gray-700 mb-1">정답 정확성</h5>
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            detail.validation_result.answer_accuracy === 'correct'
                              ? 'bg-green-100 text-green-800'
                              : detail.validation_result.answer_accuracy === 'incorrect'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {detail.validation_result.answer_accuracy === 'correct' ? '정확' :
                             detail.validation_result.answer_accuracy === 'incorrect' ? '오류' : '불명확'}
                          </span>
                        </div>
                        <div className="text-center">
                          <h5 className="font-medium text-gray-700 mb-1">해설 품질</h5>
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            detail.validation_result.explanation_quality === 'excellent'
                              ? 'bg-green-100 text-green-800'
                              : detail.validation_result.explanation_quality === 'good'
                              ? 'bg-blue-100 text-blue-800'
                              : detail.validation_result.explanation_quality === 'needs_improvement'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {detail.validation_result.explanation_quality === 'excellent' ? '우수' :
                             detail.validation_result.explanation_quality === 'good' ? '좋음' :
                             detail.validation_result.explanation_quality === 'needs_improvement' ? '보완필요' : '부족'}
                          </span>
                        </div>
                        <div className="text-center">
                          <h5 className="font-medium text-gray-700 mb-1">정답-해설 정합성</h5>
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            detail.validation_result.math_correctness === 'consistent'
                              ? 'bg-green-100 text-green-800'
                              : detail.validation_result.math_correctness === 'inconsistent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {detail.validation_result.math_correctness === 'consistent' ? '일치' :
                             detail.validation_result.math_correctness === 'inconsistent' ? '불일치' : '불명확'}
                          </span>
                        </div>
                      </div>

                      {/* 이슈 및 제안사항 */}
                      {(detail.validation_result.issues.length > 0 || detail.validation_result.suggestions.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {detail.validation_result.issues.length > 0 && (
                            <div>
                              <h5 className="font-medium text-red-700 mb-2">발견된 문제점</h5>
                              <ul className="text-sm text-red-600 space-y-1">
                                {detail.validation_result.issues.map((issue, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-red-500 mr-2">•</span>
                                    {issue}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {detail.validation_result.suggestions.length > 0 && (
                            <div>
                              <h5 className="font-medium text-blue-700 mb-2">개선 제안</h5>
                              <ul className="text-sm text-blue-600 space-y-1">
                                {detail.validation_result.suggestions.map((suggestion, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">상세 검증 데이터를 불러오는 중입니다...</p>
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailReport(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  // TODO: 리포트 다운로드 또는 인쇄 기능
                  console.log('리포트 내보내기');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                리포트 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}