import React from 'react';

interface EnglishContentRendererProps {
  content: string;
  className?: string;
}

export const EnglishContentRenderer: React.FC<EnglishContentRendererProps> = ({
  content,
  className = ''
}) => {
  // HTML 태그를 React 컴포넌트로 변환
  const renderContent = (text: string) => {
    // null, undefined, 또는 string이 아닌 경우 빈 문자열 반환
    if (!text || typeof text !== 'string') {
      return '';
    }

    // 간단한 HTML 태그들을 처리
    const htmlContent = text
      .replace(/<u>(.*?)<\/u>/g, '<span class="underline">$1</span>')
      .replace(/<b>(.*?)<\/b>/g, '<span class="font-bold">$1</span>')
      .replace(/<strong>(.*?)<\/strong>/g, '<span class="font-bold">$1</span>')
      .replace(/<i>(.*?)<\/i>/g, '<span class="italic">$1</span>')
      .replace(/<em>(.*?)<\/em>/g, '<span class="italic">$1</span>')
      .replace(/<mark>(.*?)<\/mark>/g, '<span class="bg-yellow-200 px-1 rounded">$1</span>')
      .replace(/<del>(.*?)<\/del>/g, '<span class="line-through">$1</span>')
      .replace(/<s>(.*?)<\/s>/g, '<span class="line-through">$1</span>')
      .replace(/<sup>(.*?)<\/sup>/g, '<span class="text-xs align-super">$1</span>')
      .replace(/<sub>(.*?)<\/sub>/g, '<span class="text-xs align-sub">$1</span>')
      .replace(/<code>(.*?)<\/code>/g, '<span class="font-mono bg-gray-100 px-1 rounded text-sm">$1</span>')
      .replace(/\n/g, '<br/>');

    return htmlContent;
  };

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: renderContent(content) }}
    />
  );
};