import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string; studentId: string } }
) {
  try {
    const { assignmentId, studentId } = await params;
    const url = new URL(request.url);
    const subject = url.searchParams.get('subject') || 'math';

    // 과목별로 다른 서비스 호출
    let targetUrl = '';
    let endpoint = '';

    if (subject === 'math') {
      targetUrl = 'http://localhost:8001';
      endpoint = `/api/assignments/${assignmentId}/student/${studentId}`;
    } else if (subject === 'korean') {
      targetUrl = 'http://localhost:8004';
      endpoint = `/api/assignments/${assignmentId}/student/${studentId}`;
    } else if (subject === 'english') {
      targetUrl = 'http://localhost:8005';
      endpoint = `/api/assignments/${assignmentId}/student/${studentId}`;
    } else {
      return NextResponse.json(
        { error: 'Invalid subject' },
        { status: 400 }
      );
    }

    // Authorization 헤더 전달
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    console.log('📡 Assignment detail request:', {
      url: `${targetUrl}${endpoint}`,
      subject,
      assignmentId,
      studentId,
      headers
    });

    // 백엔드 서비스로 요청 전달
    const response = await fetch(`${targetUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });

    console.log('📥 Backend response status:', response.status, response.ok);

    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    let data;
    if (isJson) {
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('❌ JSON parsing error:', jsonError);
        const textResponse = await response.text();
        data = { error: textResponse };
      }
    } else {
      const textResponse = await response.text();
      console.log('📥 Backend text response:', textResponse);
      data = { error: textResponse };
    }

    console.log('📥 Backend data:', data);

    if (!response.ok) {
      console.error('❌ Backend error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Assignment detail proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}