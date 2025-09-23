import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, ...requestData } = body;

    // 과목별로 다른 서비스 호출
    let targetUrl = '';
    let endpoint = '';

    if (subject === 'math') {
      targetUrl = 'http://localhost:8001';
      endpoint = '/assignments/deploy';
    } else if (subject === 'korean') {
      targetUrl = 'http://localhost:8004';
      endpoint = '/api/assignments/deploy';
    } else if (subject === 'english') {
      targetUrl = 'http://localhost:8002';
      endpoint = '/api/english/assignments/deploy';
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

    // 백엔드 서비스로 요청 전달
    console.log('📡 Proxy request:', {
      url: `${targetUrl}${endpoint}`,
      subject,
      requestData,
      headers
    });

    const response = await fetch(`${targetUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData),
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
    console.error('Assignment deploy proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}