import { NextRequest, NextResponse } from 'next/server'

// Use a more specific environment variable name for the Render voice server
const VOICE_SERVER_URL = process.env.RENDER_VOICE_SERVER_URL || process.env.VOICE_SERVER_URL || process.env.NEXT_PUBLIC_VOICE_SERVER_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Validate that we have a voice server URL
    if (!VOICE_SERVER_URL || VOICE_SERVER_URL === 'http://localhost:8000') {
      console.error('TTS proxy error: No valid voice server URL configured')
      return NextResponse.json({ 
        error: 'Voice server not configured. Please set RENDER_VOICE_SERVER_URL environment variable.' 
      }, { status: 500 })
    }

    const body = await request.json()
    
    console.log(`Forwarding TTS request to voice server: ${VOICE_SERVER_URL}/api/text-to-speech`)

    const upstream = await fetch(`${VOICE_SERVER_URL}/api/text-to-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!upstream.ok) {
      console.error(`Voice server responded with status: ${upstream.status}`)
      const errorText = await upstream.text().catch(() => 'Unknown error')
      console.error('Voice server error:', errorText)
      return NextResponse.json({ 
        error: `Voice server error: ${upstream.status} - ${errorText}` 
      }, { status: upstream.status })
    }

    // Binary audio passthrough
    const arrayBuffer = await upstream.arrayBuffer()
    return new NextResponse(Buffer.from(arrayBuffer), {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') || 'audio/mpeg',
        'content-disposition': upstream.headers.get('content-disposition') || 'attachment; filename=speech.mp3',
      },
    })
  } catch (error: any) {
    console.error('TTS proxy error:', error)
    return NextResponse.json({ 
      error: 'Text-to-speech proxy failed',
      details: error.message 
    }, { status: 500 })
  }
}


