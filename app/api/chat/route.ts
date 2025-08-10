import { NextRequest, NextResponse } from 'next/server'

const VOICE_SERVER_URL = process.env.NEXT_PUBLIC_VOICE_SERVER_URL || process.env.VOICE_SERVER_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Read incoming JSON
    const incoming = await request.json().catch(() => null)
    if (!incoming) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { messages, model, temperature, maxTokens, max_tokens } = incoming
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    // Map camelCase -> snake_case to match voice_server schema
    const payload = {
      messages,
      model: typeof model === 'string' && model.trim() ? model : 'llama-3.3-70b-versatile',
      temperature: typeof temperature === 'number' ? temperature : 0.7,
      max_tokens: typeof max_tokens === 'number' ? max_tokens : (typeof maxTokens === 'number' ? maxTokens : 1024),
    }

    const upstream = await fetch(`${VOICE_SERVER_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const contentType = upstream.headers.get('content-type') || 'application/json'
    const text = await upstream.text()

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        'content-type': contentType,
      },
    })
  } catch (error) {
    console.error('Chat proxy error:', error)
    return NextResponse.json({ error: 'Chat proxy failed' }, { status: 500 })
  }
}