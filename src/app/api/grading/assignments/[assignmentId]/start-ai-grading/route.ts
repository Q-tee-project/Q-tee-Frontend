import { NextRequest, NextResponse } from 'next/server';

export async function POST(
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
      endpoint = `/api/grading/assignments/${assignmentId}/start-ai-grading`;
    } else {
      return NextResponse.json(
        { error: 'AI grading only supported for math assignments' },
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
      method: 'POST',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('AI grading start proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}