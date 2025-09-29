import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const { assignmentId } = await params;
    const url = new URL(request.url);
    const subject = url.searchParams.get('subject') || 'math';

    let targetUrl = '';
    let endpoint = '';

    if (subject === 'math') {
      targetUrl = 'http://localhost:8001';
      endpoint = `/api/grading/assignments/${assignmentId}/results`;
    } else if (subject === 'korean') {
      targetUrl = 'http://localhost:8004';
      endpoint = `/api/grading/assignments/${assignmentId}/results`;
    } else {
      return NextResponse.json(
        { error: 'Invalid subject for grading results' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await fetch(`${targetUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Assignment results proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}