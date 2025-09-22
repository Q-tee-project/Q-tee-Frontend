import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const { assignmentId } = params;
    const body = await request.json();
    const { student_id } = body;
    const url = new URL(request.url);
    const subject = url.searchParams.get('subject') || 'math';

    let targetUrl = '';
    let endpoint = '';

    if (subject === 'math') {
      targetUrl = 'http://localhost:8001';
      endpoint = `/assignments/${assignmentId}/start`;
    } else {
      return NextResponse.json(
        { error: 'Invalid subject for starting a test' },
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
      body: JSON.stringify({ student_id }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Assignment start proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
