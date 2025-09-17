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

    // 백엔드에서 생성된 중복 $ 정리 ($$$ -> $)
    text = text.replace(/\$+/g, '$');

    // 연속된 LaTeX 수식 병합 ($a$$b$ -> $ab$)
    text = text.replace(/\$([^$]*)\$\$([^$]*)\$/g, '$$$1$2$$');

    // 빈 LaTeX 수식 제거 ($$)
    text = text.replace(/\$\s*\$/g, '');

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

    return parts
      .map((part) => {
        // $ 기호로 감싸진 부분은 LaTeX로 렌더링
        if (part.startsWith('$') && part.endsWith('$')) {
          return renderSingleMathExpression(part);
        } else {
          // 일반 텍스트 처리 - 혼합 컨텐츠 고려
          return processTextContent(part);
        }
      })
      .join('');
  };

  const processTextContent = (text: string): string => {
    // 잘못된 $ 기호 제거
    text = cleanTextContent(text);

    // 혼합 컨텐츠 처리: 변수+한글 (x축, y절편 등)
    // 이미 백엔드에서 $x$축 형태로 처리되어 올 수 있지만, 혹시 놓친 경우를 위해
    text = text.replace(/\b([a-zA-Z])([가-힣]+)/g, (match, variable, korean) => {
      // 단일 변수 + 한글인 경우, 변수만 LaTeX로 렌더링
      try {
        const renderedVar = katex.renderToString(variable, {
          displayMode: false,
          throwOnError: false,
          strict: false,
        });
        return renderedVar + korean;
      } catch (error) {
        return match; // 실패 시 원본 반환
      }
    });

    return text;
  };

  const renderSingleMathExpression = (mathString: string): string => {
    const isDisplayMode = mathString.startsWith('$$') && mathString.endsWith('$$');
    let math = isDisplayMode ? mathString.slice(2, -2) : mathString.slice(1, -1);

    // 빈 수식이나 순수 숫자/텍스트는 LaTeX 렌더링하지 않음
    if (
      !math.trim() ||
      /^\d+$/.test(math.trim()) ||
      /^\d+,\d+/.test(math.trim()) ||
      /^[가-힣\s,]+$/.test(math.trim())  // 순수 한글만 있는 경우 제외 (변수 포함된 것은 렌더링)
    ) {
      return math.trim();
    }

    // 백엔드에서 처리되지 못한 추가 패턴들 정리
    // 1. 함수 표현에서 공백 정리: P( x+y , y-x ) -> P(x+y, y-x)
    math = math.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s*,\s*/g, ', ');

    // 2. 분수에서 불필요한 공백 제거: \frac{ a+b }{ 2 } -> \frac{a+b}{2}
    math = math.replace(/\\frac\{\s*/g, '\\frac{').replace(/\s*\}\{\s*/g, '}{').replace(/\s*\}/g, '}');

    // 3. 지수 표현 정리
    math = math.replace(/(\w+\^\{[^}]+\})\s+(\w+\^\{[^}]+\})/g, '$1 \\cdot $2');
    math = math.replace(/(\w+)\^\{(\w+)\}\s+(\w+)\^\{(\w+)\}/g, '$1^{$2} \\cdot $3^{$4}');

    // 4. 연산자 주변 공백 정리
    math = math.replace(/\s*([+\-*/=])\s*/g, ' $1 ').replace(/\s+/g, ' ').trim();

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
