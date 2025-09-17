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
      // 1단계: 기본 정리
      let processedText = cleanBasicPatterns(text);

      // 2단계: 줄바꿈 처리
      processedText = handleLineBreaks(processedText);

      // 3단계: 수식과 일반 텍스트 분리 처리
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

    return text;
  };

  const handleLineBreaks = (text: string): string => {
    // 줄바꿈 패턴들을 <br />로 변환
    text = text.replace(/\\n/g, '<br />');
    text = text.replace(/\n/g, '<br />');

    // 잘못된 br 태그 수정 (< < 같은 경우)
    text = text.replace(/\s*<\s*<\s*/g, '<br />');
    text = text.replace(/\s*<\s*br\s*\/?\s*>\s*/gi, '<br />');

    return text;
  };

  const renderMixedContent = (text: string): string => {
    // 텍스트를 $ 기호를 기준으로 분할
    const parts = text.split(/(\$[^$]*\$|\$\$[^$]*\$\$)/);

    return parts.map((part, index) => {
      // $ 기호로 감싸진 부분은 LaTeX로 렌더링
      if (part.startsWith('$') && part.endsWith('$')) {
        return renderSingleMathExpression(part);
      } else {
        // 일반 텍스트는 그대로 반환 (잘못된 $ 기호만 제거)
        return cleanTextContent(part);
      }
    }).join('');
  };

  const renderSingleMathExpression = (mathString: string): string => {
    const isDisplayMode = mathString.startsWith('$$') && mathString.endsWith('$$');
    const math = isDisplayMode
      ? mathString.slice(2, -2)
      : mathString.slice(1, -1);

    // 빈 수식이나 순수 숫자/텍스트는 LaTeX 렌더링하지 않음
    if (!math.trim() ||
        /^\d+$/.test(math.trim()) ||
        /^\d+,\d+/.test(math.trim()) ||
        /^[가-힣a-zA-Z\s,]+$/.test(math.trim())) {
      return math.trim();
    }

    try {
      const rendered = katex.renderToString(math, {
        displayMode: isDisplayMode,
        throwOnError: false,
        strict: false,
      });
      return rendered;
    } catch (error) {
      console.warn('LaTeX rendering error:', error, 'for math:', math);
      return math; // 수식 부분만 반환 ($ 기호 제거)
    }
  };

  const cleanTextContent = (text: string): string => {
    // 일반 텍스트에서 잘못된 $ 기호 제거
    // $16,28,40 같은 패턴
    text = text.replace(/\$(\d+(?:,\d+)*)/g, '$1');

    // 단독 $ 기호 제거
    text = text.replace(/(?<!\$)\$(?!\$)(?![a-zA-Z\\])/g, '');

    // 남은 LaTeX 명령어들 (백엔드에서 놓친 것들) 제거
    text = text.replace(/\\[a-zA-Z]+/g, '');

    return text;
  };


  const processedContent = renderLaTeX(content);

  return <div className={className} dangerouslySetInnerHTML={{ __html: processedContent }} />;
};
