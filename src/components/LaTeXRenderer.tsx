import React from 'react';

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
      // 1단계: 기본 패턴 정리 (잘못된 분수 표기 등)
      let processedText = cleanBasicPatterns(text);

      // 2단계: 수식과 일반 텍스트 분리 및 렌더링
      processedText = renderMixedContent(processedText);

      return processedText;
    } catch (error) {
      console.warn('LaTeX parsing error:', error);
      return text;
    }
  };

  const cleanBasicPatterns = (text: string): string => {
    // 이중 백슬래시 정리
    text = text.replace(/\\\\/g, '\\');

    // 이스케이프된 $ 기호 정리
    text = text.replace(/\\\$/g, '$');

    // 백엔드에서 생성된 중복 $ 정리 ($$$ -> $)
    text = text.replace(/\$+/g, '$');

    // 연속된 LaTeX 수식 병합 ($a$$b$ -> $ab$)
    text = text.replace(/\$([^$]*)\$\$([^$]*)\$/g, '$$$1$2$$');

    // 빈 LaTeX 수식 제거 ($$)
    text = text.replace(/\$\s*\$/g, '');

    // 분수 패턴 전처리 개선
    // \frac{a},{b} 또는 \frac a,b 또는 \frac{a},b 패턴을 \frac{a}{b}로 변환
    text = text.replace(/\\frac\s*\{?([^}]*?)\s*\}?\s*,\s*\{?([^}]*?)\}/g, '\\frac{$1}{$2}');

    // 이중 백슬래시 + 쉼표 분수 패턴도 처리
    text = text.replace(/\\\\frac\s*\{?([^}]*?)\s*\}?\s*,\s*\{?([^}]*?)\}/g, '\\frac{$1}{$2}');

    return text;
  };

  const renderMixedContent = (text: string): string => {
    // 텍스트를 $ 기호와 \frac{} 패턴을 기준으로 분할
    const parts = text.split(/(\$[^$]*\$|\$\$[^$]*\$\$|\\frac\{[^}]*\}\{[^}]*\})/g);

    return parts
      .map((part) => {
        if (!part) return '';
        // $ 기호로 감싸진 부분은 LaTeX로 렌더링
        if (part.startsWith('$') && part.endsWith('$')) {
          return renderSingleMathExpression(part);
        }
        // \frac{} 패턴이 포함된 부분은 LaTeX로 렌더링
        else if (part.startsWith('\\frac{') && part.endsWith('}')) {
          return renderSingleMathExpression('$' + part + '$');
        } else {
          // 일반 텍스트 처리 (줄바꿈 변환 및 불필요한 $ 제거)
          return cleanTextContent(part);
        }
      })
      .join('');
  };

  const cleanTextContent = (text: string): string => {
    // AI가 생성한 '\\n'과 일반 '\n'을 모두 <br />로 변환
    // 이 로직이 일반 텍스트에만 적용됩니다.
    text = text.replace(/\\n/g, '<br />'); // AI가 생성한 literal '\n' 처리
    text = text.replace(/\n/g, '<br />'); // 일반 개행 문자 처리

    return text;
  };

  const renderSingleMathExpression = (mathString: string): string => {
    const isDisplayMode = mathString.startsWith('$$') && mathString.endsWith('$$');
    let math = isDisplayMode ? mathString.slice(2, -2) : mathString.slice(1, -1);

    // 빈 수식이나 순수 숫자/텍스트는 LaTeX 렌더링하지 않음
    if (!math.trim() || /^[가-힣\s,]+$/.test(math.trim())) {
      return math.trim();
    }

    // 불필요한 공백 제거
    math = math.replace(/\s*([+\-*/=])\s*/g, ' $1 ').trim();

    try {
      const rendered = katex.renderToString(math, {
        displayMode: isDisplayMode,
        throwOnError: false,
        strict: false,
        output: 'mathml', // MathML만 출력
      });
      return rendered;
    } catch (error) {
      console.warn('LaTeX rendering error:', error, 'for math:', math);
      return math;
    }
  };

  const processedContent = renderLaTeX(content);

  return <div className={className} dangerouslySetInnerHTML={{ __html: processedContent }} />;
};
