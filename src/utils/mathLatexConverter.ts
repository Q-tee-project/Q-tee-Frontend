// 간단한 수학 표기법을 LaTeX로 자동 변환하는 유틸리티

export interface ConversionPattern {
  name: string;
  description: string;
  example: string;
  result: string;
}

// 지원되는 변환 패턴 목록
export const supportedPatterns: ConversionPattern[] = [
  { name: '수학식', description: '전체 수학 표현식을 자동 감지', example: 'x^2 + 2x - 1', result: '$x^{2} + 2x - 1$' },
  { name: '지수', description: '제곱, 세제곱 등', example: 'x^2, 2^3', result: '$x^{2}$, $2^{3}$' },
  { name: '분수', description: '분수 표기', example: '1/2, (x+1)/(x-1)', result: '$\\frac{1}{2}$, $\\frac{x+1}{x-1}$' },
  { name: '제곱근', description: '루트 표기', example: 'sqrt(2), sqrt(x+1)', result: '$\\sqrt{2}$, $\\sqrt{x+1}$' },
  { name: '그리스 문자', description: '알파, 베타 등', example: 'alpha, beta, pi', result: '$\\alpha$, $\\beta$, $\\pi$' },
  { name: '부등호', description: '크거나 같다, 작거나 같다', example: '<=, >=, !=', result: '$\\leq$, $\\geq$, $\\neq$' },
];

/**
 * 수학 표현식을 감지하고 LaTeX로 변환
 * @param text 변환할 텍스트
 * @returns LaTeX 문법으로 변환된 텍스트
 */
export const autoConvertToLatex = (text: string): string => {
  if (!text || text.trim() === '') return text;
  
  // 이미 LaTeX 문법이 포함된 경우 그대로 반환
  if (hasLatexSyntax(text)) return text;
  
  let converted = text.trim();
  
  // 1단계: 특수 함수들을 먼저 처리
  converted = convertSpecialFunctions(converted);
  
  // 2단계: 그리스 문자 변환
  converted = convertGreekLetters(converted);
  
  // 3단계: 특수 기호들 변환
  converted = convertSpecialSymbols(converted);
  
  // 4단계: 분수 처리: a/b -> \frac{a}{b}
  converted = converted.replace(/([a-zA-Z0-9\)]+|\([^)]+\))\/([a-zA-Z0-9\(]+|\([^)]+\))/g, '\\frac{$1}{$2}');
  
  // 5단계: 지수 처리: x^2 -> x^{2}
  converted = converted.replace(/\^(\d+)/g, '^{$1}');
  converted = converted.replace(/\^([a-zA-Z])/g, '^{$1}');
  
  // 6단계: 곱셈 기호 처리: * -> \times
  converted = converted.replace(/\*/g, '\\times');
  
  // 7단계: 수학식인지 확인하고 전체를 $ 로 감싸기
  if (isMathExpression(converted)) {
    converted = `$${converted}$`;
  }
  
  return converted;
};

/**
 * 특수 함수들을 LaTeX로 변환
 */
const convertSpecialFunctions = (text: string): string => {
  let converted = text;
  
  // 제곱근: sqrt(x) -> \sqrt{x}
  converted = converted.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
  
  // 삼각함수들
  converted = converted.replace(/\bsin\(/g, '\\sin(');
  converted = converted.replace(/\bcos\(/g, '\\cos(');
  converted = converted.replace(/\btan\(/g, '\\tan(');
  converted = converted.replace(/\blog\(/g, '\\log(');
  converted = converted.replace(/\bln\(/g, '\\ln(');
  
  return converted;
};

/**
 * 그리스 문자들을 LaTeX로 변환
 */
const convertGreekLetters = (text: string): string => {
  let converted = text;
  
  const greekLetters = [
    ['alpha', '\\alpha'], ['beta', '\\beta'], ['gamma', '\\gamma'],
    ['delta', '\\delta'], ['theta', '\\theta'], ['pi', '\\pi'],
    ['sigma', '\\sigma'], ['lambda', '\\lambda'], ['mu', '\\mu'],
    ['omega', '\\omega'], ['phi', '\\phi'], ['psi', '\\psi']
  ];
  
  greekLetters.forEach(([pattern, replacement]) => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'g');
    converted = converted.replace(regex, replacement);
  });
  
  return converted;
};

/**
 * 특수 기호들을 LaTeX로 변환
 */
const convertSpecialSymbols = (text: string): string => {
  let converted = text;
  
  // 순서가 중요함 (긴 패턴부터)
  converted = converted.replace(/<=>/g, '\\Leftrightarrow');
  converted = converted.replace(/<=/g, '\\leq');
  converted = converted.replace(/>=/g, '\\geq');
  converted = converted.replace(/!=/g, '\\neq');
  converted = converted.replace(/\binfinity\b/g, '\\infty');
  converted = converted.replace(/\+-/g, '\\pm');
  
  // 집합 기호들
  converted = converted.replace(/\bin\b/g, '\\in');
  converted = converted.replace(/\bsubset\b/g, '\\subset');
  converted = converted.replace(/\bunion\b/g, '\\cup');
  converted = converted.replace(/\bintersect\b/g, '\\cap');
  
  return converted;
};

/**
 * 수학 표현식인지 판단
 */
const isMathExpression = (text: string): boolean => {
  // 수학 기호나 패턴이 포함된 경우
  const mathIndicators = [
    /\^{[^}]+}/, // 지수 (중괄호 포함)
    /\^/, // 지수 기호
    /\\frac/, // 분수
    /\\times/, // 곱셈
    /\\[a-zA-Z]+/, // LaTeX 명령어들
    /[+\-=<>≤≥≠]/, // 연산자들
    /[a-zA-Z]\s*[+\-=<>]\s*[a-zA-Z0-9]/, // 변수와 연산자
    /[0-9]\s*[+\-=<>]\s*[a-zA-Z]/, // 숫자와 변수 연산
  ];
  
  return mathIndicators.some(pattern => pattern.test(text));
};

/**
 * 텍스트에 LaTeX 문법이 포함되어 있는지 확인
 * @param text 확인할 텍스트
 * @returns LaTeX 문법 포함 여부
 */
export const hasLatexSyntax = (text: string): boolean => {
  // LaTeX 명령어나 이미 처리된 문법만 확인 (단순한 ^ 기호는 제외)
  return /\\[a-zA-Z]+|[\{\}]|\$/.test(text);
};

/**
 * 자동 변환 모드 토글용 헬퍼
 * @param text 원본 텍스트
 * @param autoConvert 자동 변환 모드 여부
 * @returns 변환된 텍스트 또는 원본 텍스트
 */
export const processText = (text: string, autoConvert: boolean = true): string => {
  return autoConvert ? autoConvertToLatex(text) : text;
};