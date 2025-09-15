import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // backend의 math_problem_types.json 파일 읽기
    const filePath = path.join(
      process.cwd(),
      '..',
      'backend',
      'services',
      'math-service',
      'data',
      'math_problem_types.json',
    );
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error('수학 문제 유형 데이터 로드 실패:', error);
    return NextResponse.json({ error: '데이터를 불러올 수 없습니다.' }, { status: 500 });
  }
}
