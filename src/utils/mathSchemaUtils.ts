// 데이터베이스 스키마 호환성 유틸리티
export const normalizeMathProblem = (problem: any): any => {
  return {
    ...problem,
    // 존재하지 않을 수 있는 필드들을 안전하게 처리
    tikz_code: problem.tikz_code || null,
    image_url: problem.image_url || null,
    created_at: problem.created_at || null,
    updated_at: problem.updated_at || null,
    has_diagram: problem.has_diagram || false,
    diagram_type: problem.diagram_type || null,
    diagram_elements: problem.diagram_elements || null,
    latex_content: problem.latex_content || null,
  };
};

// 워크시트 응답 정규화
export const normalizeWorksheetResponse = (response: any): { worksheet: any; problems: any[] } => {
  const worksheet = response.worksheet || response;
  const problems = (response.problems || []).map(normalizeMathProblem);
  
  return { worksheet, problems };
};

// 데이터베이스 스키마 오류 감지
export const isDatabaseSchemaError = (error: any): boolean => {
  return error?.message?.includes('does not exist') || 
         error?.detail?.includes('does not exist') ||
         error?.message?.includes('column') && error?.message?.includes('does not exist');
};

// 안전한 API 응답 처리
export const safeApiResponse = <T>(response: T, fallback: T): T => {
  try {
    return response || fallback;
  } catch {
    return fallback;
  }
};
