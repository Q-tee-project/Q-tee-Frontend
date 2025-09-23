import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const url = new URL(request.url);
    const subject = url.searchParams.get('subject') || 'math';

    let targetUrl = '';
    let endpoint = '';

    if (subject === 'math') {
      targetUrl = 'http://localhost:8001';
      endpoint = `/api/grading/tasks/${taskId}/status`;
    } else {
      return NextResponse.json(
        { error: 'Task status only supported for math service' },
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
    console.error('Task status proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}