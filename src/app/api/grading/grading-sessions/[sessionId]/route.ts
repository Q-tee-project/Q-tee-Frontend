import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    const subject = request.nextUrl.searchParams.get('subject') || 'math';

    console.log(`[API] Getting grading session ${sessionId} for subject: ${subject}`);

    // Get auth header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('[API] No authorization header');
      return NextResponse.json({ detail: 'Authorization header required' }, { status: 401 });
    }

    // Forward to the appropriate service based on subject
    const serviceUrl = subject === 'korean'
      ? process.env.NEXT_PUBLIC_KOREAN_API_URL || 'http://localhost:8004/api'
      : process.env.NEXT_PUBLIC_MATH_API_URL || 'http://localhost:8001/api';

    const targetUrl = `${serviceUrl}/grading/grading-sessions/${sessionId}`;
    console.log(`[API] Forwarding to: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[API] Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[API] Backend error: ${errorText}`);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: `Service error: ${response.status}` };
      }

      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log(`[API] Success: returning data for session ${sessionId}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Grading session details error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    const subject = request.nextUrl.searchParams.get('subject') || 'math';

    // Get auth header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ detail: 'Authorization header required' }, { status: 401 });
    }

    const requestBody = await request.json();

    // Forward to the appropriate service based on subject
    const serviceUrl = subject === 'korean'
      ? process.env.NEXT_PUBLIC_KOREAN_API_URL || 'http://localhost:8004/api'
      : process.env.NEXT_PUBLIC_MATH_API_URL || 'http://localhost:8001/api';

    const response = await fetch(`${serviceUrl}/grading/grading-sessions/${sessionId}/update`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Service error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Grading session update error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}