// 간단한 수학 표기법을 LaTeX로 자동 변환하는 유틸리티

export interface ConversionPattern {
  name: string;
  description: string;
  example: string;
  result: string;
}

// 지원되는 변환 패턴 목록
export const supportedPatterns: ConversionPattern[] = [
  { name: '변수', description: '수식 내 단일 문자', example: 'x = 5, y + z', result: '$x$ = 5, $y$ + $z$' },
  { name: '지수', description: '제곱, 세제곱 등', example: '2^3, x^2', result: '2^{3}, $x$^{2}' },
  { name: '분수', description: '분수 표기', example: '1/2, a/b', result: '\\frac{1}{2}, \\frac{$a$}{$b$}' },
  { name: '제곱근', description: '루트 표기', example: 'sqrt(2), sqrt(x+1)', result: '\\sqrt{2}, \\sqrt{$x$+1}' },
  { name: '그리스 문자', description: '알파, 베타 등', example: 'alpha, beta, pi', result: 'α, β, π' },
  { name: '부등호', description: '크거나 같다, 작거나 같다', example: '<=, >=, !=', result: '≤, ≥, ≠' },
];

/**
 * 간단한 수학 표기법을 LaTeX 문법으로 자동 변환
 * @param text 변환할 텍스트
 * @returns LaTeX 문법으로 변환된 텍스트
 */
export const autoConvertToLatex = (text: string): string => {
  let converted = text;

  // 1단계: 수학적 맥락에서 단일 변수를 수학 모드로 변환
  // 수식 연산자 주변이나 등호 주변의 단일 문자 변수들을 변환
  converted = converted.replace(/\b([a-z])\s*([=+\-])/g, '$$$$1$$ $2');
  converted = converted.replace(/([=+\-])\s*([a-z])\b/g, '$1 $$$$2$$');
  converted = converted.replace(/\b([a-z])\s*\^/g, '$$$$1$$^');
  
  // 2단계: 지수 표기법: 2^2 -> 2^{2}, x^3 -> x^{3}
  // 복잡한 지수도 처리: (x+1)^2 -> (x+1)^{2}
  converted = converted.replace(/([a-zA-Z0-9\)$]+|\([^)]+\))\^([a-zA-Z0-9]+|\([^)]+\))/g, '$1^{$2}');
  
  // 3단계: 분수 표기법을 처리하기 전에 변수를 먼저 변환
  converted = converted.replace(/\b([a-z])\s*\/\s*([a-z])\b/g, '$$$$1$$ / $$$$2$$');
  
  // 4단계: 분수 표기법: a/b -> \frac{a}{b}
  // 복잡한 분수도 처리: (x+1)/(y-1) -> \frac{x+1}{y-1}
  converted = converted.replace(/([a-zA-Z0-9\)$]+|\([^)]+\))\/([a-zA-Z0-9\($]+|\([^)]+\))/g, '\\frac{$1}{$2}');
  
  // 제곱근: sqrt(x) -> \sqrt{x}
  converted = converted.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
  
  // 그리스 문자들
  converted = converted.replace(/\balpha\b/g, '\\alpha');
  converted = converted.replace(/\bbeta\b/g, '\\beta');
  converted = converted.replace(/\bgamma\b/g, '\\gamma');
  converted = converted.replace(/\bdelta\b/g, '\\delta');
  converted = converted.replace(/\btheta\b/g, '\\theta');
  converted = converted.replace(/\bpi\b/g, '\\pi');
  converted = converted.replace(/\bsigma\b/g, '\\sigma');
  converted = converted.replace(/\blambda\b/g, '\\lambda');
  converted = converted.replace(/\bmu\b/g, '\\mu');
  
  // 특수 기호들
  converted = converted.replace(/<=>/g, '\\Leftrightarrow');
  converted = converted.replace(/<=/g, '\\leq');
  converted = converted.replace(/>=/g, '\\geq');
  converted = converted.replace(/!=/g, '\\neq');
  converted = converted.replace(/\binfinity\b/g, '\\infty');
  converted = converted.replace(/\+-/g, '\\pm');
  
  // 함수들 (단어 경계 사용)
  converted = converted.replace(/\bsin\(/g, '\\sin(');
  converted = converted.replace(/\bcos\(/g, '\\cos(');
  converted = converted.replace(/\btan\(/g, '\\tan(');
  converted = converted.replace(/\blog\(/g, '\\log(');
  converted = converted.replace(/\bln\(/g, '\\ln(');
  
  // 집합 기호들
  converted = converted.replace(/\bin\b/g, '\\in');
  converted = converted.replace(/\bsubset\b/g, '\\subset');
  converted = converted.replace(/\bunion\b/g, '\\cup');
  converted = converted.replace(/\bintersect\b/g, '\\cap');
  
  return converted;
};

/**
 * 텍스트에 LaTeX 문법이 포함되어 있는지 확인
 * @param text 확인할 텍스트
 * @returns LaTeX 문법 포함 여부
 */
export const hasLatexSyntax = (text: string): boolean => {
  return /\\[a-zA-Z]+|[\{\}]|\^|\$/.test(text);
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