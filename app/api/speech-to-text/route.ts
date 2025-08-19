import { NextRequest, NextResponse } from 'next/server'

// Use a more specific environment variable name for the Render voice server
const VOICE_SERVER_URL = process.env.RENDER_VOICE_SERVER_URL || process.env.VOICE_SERVER_URL || process.env.NEXT_PUBLIC_VOICE_SERVER_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Validate that we have a voice server URL
    if (!VOICE_SERVER_URL || VOICE_SERVER_URL === 'http://localhost:8000') {
      console.error('STT proxy error: No valid voice server URL configured')
      return NextResponse.json({ 
        error: 'Voice server not configured. Please set RENDER_VOICE_SERVER_URL environment variable.' 
      }, { status: 500 })
    }

    const incomingForm = await request.formData()
    const file = incomingForm.get('file') as unknown as File | null
    const modelId = (incomingForm.get('model_id') as string) || 'scribe_v1'

    const forwardForm = new FormData()
    if (file) {
      forwardForm.append('file', file, (file as File).name || 'recording.webm')
    }
    forwardForm.append('model_id', modelId)

    console.log(`Forwarding request to voice server: ${VOICE_SERVER_URL}/api/speech-to-text`)

    const upstream = await fetch(`${VOICE_SERVER_URL}/api/speech-to-text`, {
      method: 'POST',
      body: forwardForm,
    })

    if (!upstream.ok) {
      console.error(`Voice server responded with status: ${upstream.status}`)
      const errorText = await upstream.text().catch(() => 'Unknown error')
      console.error('Voice server error:', errorText)
      return NextResponse.json({ 
        error: `Voice server error: ${upstream.status} - ${errorText}` 
      }, { status: upstream.status })
    }

    const contentType = upstream.headers.get('content-type') || 'application/json'
    const text = await upstream.text()

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        'content-type': contentType,
      },
    })
  } catch (error: any) {
    console.error('STT proxy error:', error)
    return NextResponse.json({ 
      error: 'Speech-to-text proxy failed',
      details: error.message 
    }, { status: 500 })
  }
}


