import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string; studentId: string } }
) {
  try {
    const { assignmentId, studentId } = params;
    const subject = request.nextUrl.searchParams.get('subject') || 'math';

    // Get auth header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ detail: 'Authorization header required' }, { status: 401 });
    }

    // Forward to the appropriate service based on subject
    const serviceUrl = subject === 'korean'
      ? process.env.NEXT_PUBLIC_KOREAN_API_URL || 'http://localhost:8004/api'
      : process.env.NEXT_PUBLIC_MATH_API_URL || 'http://localhost:8001/api';

    const response = await fetch(`${serviceUrl}/grading/assignments/${assignmentId}/students/${studentId}/result`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Service error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Student grading result error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}