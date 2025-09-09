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
  displayMode = false 
}) => {
  const renderLaTeX = (text: string) => {
    if (!text) return '';
    
    try {
      // LaTeX 수식을 찾아서 변환
      const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;
      
      return text.replace(latexRegex, (match, displayMath, inlineMath) => {
        const math = displayMath || inlineMath;
        const isDisplay = !!displayMath;
        
        try {
          return katex.renderToString(math, {
            displayMode: isDisplay,
            throwOnError: false,
            strict: false
          });
        } catch (error) {
          console.warn('LaTeX rendering error:', error);
          return match; // 원본 텍스트 반환
        }
      });
    } catch (error) {
      console.warn('LaTeX parsing error:', error);
      return text;
    }
  };

  const processedContent = renderLaTeX(content);

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};