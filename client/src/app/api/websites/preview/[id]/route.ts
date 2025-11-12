// app/api/websites/preview/[id]/route.ts
// Next.js API route proxy for website preview images
// This allows us to add authentication headers when fetching preview images

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '../../../../../lib/apiConfig';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get auth token from Authorization header (client will send it)
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    // Fetch preview from backend
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/websites/preview/${id}`, {
      method: 'GET',
      headers,
      cache: 'no-store', // Don't cache to ensure fresh previews
    });

    if (!response.ok) {
      return new NextResponse('Preview not found', { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching preview:', error);
    return new NextResponse('Error fetching preview', { status: 500 });
  }
}

