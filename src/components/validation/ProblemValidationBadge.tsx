'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  TrendingUp,
  AlertCircle,
  Zap
} from 'lucide-react';

export interface ValidationResult {
  is_valid: boolean;
  math_accuracy: string;
  answer_correctness: string;
  explanation_quality: string;
  latex_syntax: string;
  difficulty_appropriateness: string;
  confidence_score: number;
  auto_approve: boolean;
  issues: string[];
  suggestions: string[];
}

interface ProblemValidationBadgeProps {
  validationResult: ValidationResult;
  className?: string;
  detailed?: boolean;
}

export function ProblemValidationBadge({
  validationResult,
  className = '',
  detailed = false
}: ProblemValidationBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);

  // 검증 결과에 따른 상태 결정
  const getStatusConfig = () => {
    if (!validationResult.is_valid) {
      return {
        status: 'invalid',
        icon: <XCircle className="w-4 h-4" />,
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        label: '검증 실패',
        description: '문제에 오류가 발견되었습니다'
      };
    }

    if (validationResult.auto_approve) {
      return {
        status: 'approved',
        icon: <CheckCircle className="w-4 h-4" />,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        label: '자동 승인',
        description: '바로 사용 가능합니다'
      };
    }

    return {
      status: 'review',
      icon: <Clock className="w-4 h-4" />,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      label: '검토 필요',
      description: '교사 검토가 필요합니다'
    };
  };

  const statusConfig = getStatusConfig();

  // 세부 검증 항목들의 상태 아이콘
  const getValidationIcon = (value: string) => {
    switch (value) {
      case '정확':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case '오류':
        return <XCircle className="w-3 h-3 text-red-600" />;
      case '의심':
        return <AlertTriangle className="w-3 h-3 text-yellow-600" />;
      case '우수':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case '보통':
        return <AlertCircle className="w-3 h-3 text-blue-600" />;
      case '부족':
        return <XCircle className="w-3 h-3 text-red-600" />;
      case '적절':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case '쉬움':
      case '어려움':
        return <AlertTriangle className="w-3 h-3 text-yellow-600" />;
      default:
        return <AlertCircle className="w-3 h-3 text-gray-600" />;
    }
  };

  if (!detailed) {
    // 간단한 배지 형태
    return (
      <div
        className={`
          inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border
          ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}
          ${className}
        `}
        title={statusConfig.description}
      >
        {statusConfig.icon}
        <span>{statusConfig.label}</span>
        <div className="flex items-center space-x-1 ml-1">
          <TrendingUp className="w-3 h-3" />
          <span className="text-xs">{(validationResult.confidence_score * 100).toFixed(0)}%</span>
        </div>
      </div>
    );
  }

  // 상세한 검증 결과 표시
  return (
    <div className={`border rounded-lg p-3 ${statusConfig.borderColor} ${statusConfig.bgColor} ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={statusConfig.textColor}>
            {statusConfig.icon}
          </div>
          <span className={`font-semibold text-sm ${statusConfig.textColor}`}>
            {statusConfig.label}
          </span>
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600">
              {(validationResult.confidence_score * 100).toFixed(0)}% 신뢰도
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title={showDetails ? '세부사항 숨기기' : '세부사항 보기'}
        >
          {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* 간단한 설명 */}
      <p className="text-xs text-gray-600 mb-2">{statusConfig.description}</p>

      {/* 세부 검증 결과 (토글 가능) */}
      {showDetails && (
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">수학적 정확성</span>
              <div className="flex items-center space-x-1">
                {getValidationIcon(validationResult.math_accuracy)}
                <span className="font-medium">{validationResult.math_accuracy}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">정답 정확성</span>
              <div className="flex items-center space-x-1">
                {getValidationIcon(validationResult.answer_correctness)}
                <span className="font-medium">{validationResult.answer_correctness}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">해설 품질</span>
              <div className="flex items-center space-x-1">
                {getValidationIcon(validationResult.explanation_quality)}
                <span className="font-medium">{validationResult.explanation_quality}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">LaTeX 문법</span>
              <div className="flex items-center space-x-1">
                {getValidationIcon(validationResult.latex_syntax)}
                <span className="font-medium">{validationResult.latex_syntax}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">난이도 적절성</span>
              <div className="flex items-center space-x-1">
                {getValidationIcon(validationResult.difficulty_appropriateness)}
                <span className="font-medium">{validationResult.difficulty_appropriateness}</span>
              </div>
            </div>
          </div>

          {/* 발견된 문제점들 */}
          {validationResult.issues && validationResult.issues.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs font-medium text-red-700 mb-1">발견된 문제점:</p>
              <ul className="text-xs text-red-600 space-y-1">
                {validationResult.issues.map((issue, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 개선 제안사항 */}
          {validationResult.suggestions && validationResult.suggestions.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs font-medium text-blue-700 mb-1">개선 제안:</p>
              <ul className="text-xs text-blue-600 space-y-1">
                {validationResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}