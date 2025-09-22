'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { ValidationSummary, ProblemValidationDetail } from './ValidationToast';

interface ValidationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: ValidationSummary | null;
}

export function ValidationReportModal({
  isOpen,
  onClose,
  summary
}: ValidationReportModalProps) {
  if (!isOpen || !summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">📊 문제별 검증 상세 리포트</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 모달 바디 */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* 전체 요약 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">검증 요약</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{summary.auto_approved}</div>
                <div className="text-gray-600">자동 승인</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">{summary.manual_review_needed}</div>
                <div className="text-gray-600">검토 필요</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{summary.invalid_problems}</div>
                <div className="text-gray-600">검증 실패</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{summary.validity_rate}%</div>
                <div className="text-gray-600">전체 유효율</div>
              </div>
            </div>
          </div>

          {/* 문제별 상세 리포트 */}
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
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md max-h-20 overflow-y-auto">
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
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md max-h-20 overflow-y-auto">
                      {detail.explanation}
                    </p>
                  </div>

                  {/* 검증 결과 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <h5 className="font-medium text-gray-700 mb-1">정답 정확성</h5>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                        detail.validation_result.answer_accuracy === 'correct'
                          ? 'bg-green-100 text-green-800'
                          : detail.validation_result.answer_accuracy === 'incorrect'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {detail.validation_result.answer_accuracy === 'correct' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {detail.validation_result.answer_accuracy === 'incorrect' && <XCircle className="w-3 h-3 mr-1" />}
                        {detail.validation_result.answer_accuracy === 'unclear' && <AlertCircle className="w-3 h-3 mr-1" />}
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
            onClick={onClose}
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
  );
}