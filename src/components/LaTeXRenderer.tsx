import React from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface LaTeXRendererProps {
  content: string;
  className?: string;
  displayMode?: boolean;
}

export const LaTeXRenderer: React.FC<LaTeXRendererProps> = ({
  content,
  className = '',
  displayMode = false,
}) => {
  const renderLaTeX = (text: string) => {
    if (!text) return '';

    try {
      // 이스케이프된 문자들을 단계적으로 정리
      let processedText = text;

      // 1단계: 이중 이스케이프된 백슬래시 정리 (\\\\ -> \)
      processedText = processedText.replace(/\\\\/g, '\\');

      // 2단계: 이스케이프된 $ 기호 정리 (\$ -> $)
      processedText = processedText.replace(/\\\$/g, '$');

      // 3단계: 남은 이스케이프된 백슬래시 정리 (\\ -> \)
      processedText = processedText.replace(/\\\\/g, '\\');

      // 4단계: 특수한 경우 처리 (stars, frac 등이 그대로 보이는 경우)
      processedText = processedText.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '\\frac{$1}{$2}');
      processedText = processedText.replace(/\\neq/g, '\\neq');
      processedText = processedText.replace(/\\times/g, '\\times');

      // 5단계: 복잡한 이스케이프 패턴 처리
      // \$\\frac -> \frac
      processedText = processedText.replace(/\\\$\\frac/g, '\\frac');
      // \\$\\frac -> \frac
      processedText = processedText.replace(/\\\\\$\\frac/g, '\\frac');

      // 추가 패턴: \$\\frac${...} -> \frac{...}
      processedText = processedText.replace(/\\\$\\frac\$\{([^}]+)\}/g, '\\frac{$1}');
      processedText = processedText.replace(/\\\\\$\\frac\$\{([^}]+)\}/g, '\\frac{$1}');

      // 더 복잡한 패턴: \$\\frac${...} = \$\\frac${...}
      processedText = processedText.replace(
        /\\\$\\frac\$\{([^}]+)\}\s*=\s*\\\$\\frac\$\{([^}]+)\}/g,
        '\\frac{$1} = \\frac{$2}',
      );

      // 6단계: stars 패턴 처리
      processedText = processedText.replace(/stars/g, '\\star');
      processedText = processedText.replace(/\\star/g, '\\star');

      // 7단계: 최종 정리 - 남은 이스케이프 패턴들
      // \$ 기호가 남아있는 경우 제거
      processedText = processedText.replace(/\\\$/g, '');

      // 연속된 백슬래시 정리
      processedText = processedText.replace(/\\\\+/g, '\\');

      // 8단계: 불완전한 LaTeX 수식 정리
      // $\frac{}{}$ -> $\frac{}{}$
      processedText = processedText.replace(/\$\\frac\{\}\{\}\$/g, '$\\frac{}{}$');

      // $\frac{}{}${...} -> $\frac{}{...}$
      processedText = processedText.replace(/\$\\frac\{\}\{\}\$\{([^}]+)\}/g, '$\\frac{}{$1}$');

      // $\frac{}{}${...}{...} -> $\frac{...}{...}$
      processedText = processedText.replace(
        /\$\\frac\{\}\{\}\$\{([^}]+)\}\{([^}]+)\}/g,
        '$\\frac{$1}{$2}$',
      );

      // 9단계: 추가 LaTeX 패턴 정리
      // $\frac{}{}${...} -> $\frac{}{...}$
      processedText = processedText.replace(/\$\\frac\{\}\{\}\$\{([^}]+)\}/g, '$\\frac{}{$1}$');

      // $\frac{}{}${...}{...} -> $\frac{...}{...}$
      processedText = processedText.replace(
        /\$\\frac\{\}\{\}\$\{([^}]+)\}\{([^}]+)\}/g,
        '$\\frac{$1}{$2}$',
      );

      // $\frac{}{}${...}{...} -> $\frac{...}{...}$
      processedText = processedText.replace(
        /\$\\frac\{\}\{\}\$\{([^}]+)\}\{([^}]+)\}/g,
        '$\\frac{$1}{$2}$',
      );

      // 10단계: 복잡한 이스케이프 패턴 정리
      // $\frac{}{}${...} -> $\frac{}{...}$
      processedText = processedText.replace(/\$\\frac\{\}\{\}\$\{([^}]+)\}/g, '$\\frac{}{$1}$');

      // $\frac{}{}${...}{...} -> $\frac{...}{...}$
      processedText = processedText.replace(
        /\$\\frac\{\}\{\}\$\{([^}]+)\}\{([^}]+)\}/g,
        '$\\frac{$1}{$2}$',
      );

      // LaTeX 수식을 찾아서 변환 ($$...$$ 또는 $...$)
      const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;

      const result = processedText.replace(latexRegex, (match, displayMath, inlineMath) => {
        const math = displayMath || inlineMath;
        const isDisplay = !!displayMath;

        try {
          const rendered = katex.renderToString(math, {
            displayMode: isDisplay,
            throwOnError: false,
            strict: false,
          });
          return rendered;
        } catch (error) {
          console.warn('LaTeX rendering error:', error, 'for math:', math);
          return match; // 원본 텍스트 반환
        }
      });

      // LaTeX 수식이 감싸져 있지 않은 경우, 수학 표현식인지 확인하고 자동으로 감싸기
      if (result === processedText && isMathExpression(processedText)) {
        try {
          const rendered = katex.renderToString(processedText, {
            displayMode: false,
            throwOnError: false,
            strict: false,
          });
          return rendered;
        } catch (error) {
          console.warn('자동 감싸기 LaTeX rendering error:', error);
          return processedText;
        }
      }

      return result;
    } catch (error) {
      console.warn('LaTeX parsing error:', error);
      return text;
    }
  };

  // 수학 표현식인지 확인하는 함수
  const isMathExpression = (text: string): boolean => {
    // 수학 기호나 패턴이 포함되어 있는지 확인
    const mathPatterns = [
      /\\[a-zA-Z]+/, // LaTeX 명령어 (예: \neq, \frac)
      /[a-zA-Z]\s*[=<>≠≤≥]/, // 변수와 비교 연산자
      /\d+\/\d+/, // 분수 형태
      /[a-zA-Z]\^/, // 지수
      /[a-zA-Z]_/, // 아래첨자
      /[+\-*/]/, // 수학 연산자
    ];

    return mathPatterns.some((pattern) => pattern.test(text));
  };

  const processedContent = renderLaTeX(content);

  return <div className={className} dangerouslySetInnerHTML={{ __html: processedContent }} />;
};
