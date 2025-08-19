import { NextRequest, NextResponse } from 'next/server'

const VOICE_SERVER_URL = process.env.NEXT_PUBLIC_VOICE_SERVER_URL || process.env.VOICE_SERVER_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const incomingForm = await request.formData()
    const file = incomingForm.get('file') as unknown as File | null
    const modelId = (incomingForm.get('model_id') as string) || 'scribe_v1'

    const forwardForm = new FormData()
    if (file) {
      forwardForm.append('file', file, (file as File).name || 'recording.webm')
    }
    forwardForm.append('model_id', modelId)

    const upstream = await fetch(`${VOICE_SERVER_URL}/api/speech-to-text`, {
      method: 'POST',
      body: forwardForm,
    })

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
    return NextResponse.json({ error: 'Speech-to-text proxy failed' }, { status: 500 })
  }
}


