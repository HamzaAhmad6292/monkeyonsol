import { NextRequest, NextResponse } from 'next/server'

const VOICE_SERVER_URL = process.env.NEXT_PUBLIC_VOICE_SERVER_URL || process.env.VOICE_SERVER_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const upstream = await fetch(`${VOICE_SERVER_URL}/api/text-to-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    // Binary audio passthrough
    const arrayBuffer = await upstream.arrayBuffer()
    return new NextResponse(Buffer.from(arrayBuffer), {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') || 'audio/mpeg',
        'content-disposition': upstream.headers.get('content-disposition') || 'attachment; filename=speech.mp3',
      },
    })
  } catch (error) {
    console.error('TTS proxy error:', error)
    return NextResponse.json({ error: 'Text-to-speech proxy failed' }, { status: 500 })
  }
}


