import React from 'react';

interface QuestionPreviewGuideProps {
  subject: 'korean' | 'math' | 'english';
}

export const QuestionPreviewGuide: React.FC<QuestionPreviewGuideProps> = ({ subject }) => {
  const getSubjectInfo = () => {
    switch (subject) {
      case 'korean':
        return {
          title: '국어 문제 생성 가이드',
          icon: '📚',
          tips: [
            '• 시, 소설, 수필/비문학, 문법 중 선택 가능',
            '• 하나의 지문으로 여러 문제 생성',
            '• 객관식, 서술형, 단답형 문제 유형 지원',
            '• 실제 문학 작품 기반 문제 생성',
          ],
        };
      case 'math':
        return {
          title: '수학 문제 생성 가이드',
          icon: '🔢',
          tips: [
            '• 중학교 1-3학년 수학 문제 생성',
            '• LaTeX 수식 자동 렌더링',
            '• 객관식, 서술형, 단답형 문제 유형 지원',
            '• 난이도별 문제 분포 설정 가능',
          ],
        };
      case 'english':
        return {
          title: '영어 문제 생성 가이드',
          icon: '🌍',
          tips: [
            '• 영어 문법, 독해, 어휘 문제 생성',
            '• 객관식, 서술형, 단답형 문제 유형 지원',
            '• 난이도별 문제 분포 설정 가능',
            '• 영어 교육과정에 맞는 문제 생성',
          ],
        };
      default:
        return {
          title: '문제 생성 가이드',
          icon: '📝',
          tips: [
            '• 각 과목별 특화된 문제 생성',
            '• 다양한 문제 유형 지원',
            '• 난이도별 문제 분포 설정 가능',
          ],
        };
    }
  };

  const { title, icon, tips } = getSubjectInfo();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-lg">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <span className="text-3xl">{icon}</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        </div>

        <div className="text-left space-y-4 text-gray-700">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">📝 문제 생성 순서</h4>
            <ol className="text-sm space-y-1 text-blue-800">
              <li>1. 좌측에서 과목을 선택하세요</li>
              <li>2. 생성 옵션을 설정하세요</li>
              <li>3. '문제 생성' 버튼을 클릭하세요</li>
              <li>4. 생성된 문제를 확인하고 수정하세요</li>
              <li>5. 문제지 이름을 입력하고 저장하세요</li>
            </ol>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">✨ 팁</h4>
            <ul className="text-sm space-y-1 text-green-800">
              {tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
