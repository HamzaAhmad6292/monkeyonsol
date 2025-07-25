import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq client (server-side)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { messages, model = 'llama-3.3-70b-versatile', temperature = 0.7, maxTokens = 1024 } = body || {};

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required and must be an array' },
        { status: 400 }
      );
    }

    if (typeof model !== 'string' || !model.trim()) {
      return NextResponse.json(
        { error: 'Model must be a non-empty string' },
        { status: 400 }
      );
    }

    if (typeof temperature !== 'number' || temperature < 0 || temperature > 2) {
      return NextResponse.json(
        { error: 'Temperature must be a number between 0 and 2' },
        { status: 400 }
      );
    }

    if (typeof maxTokens !== 'number' || maxTokens <= 0) {
      return NextResponse.json(
        { error: 'maxTokens must be a positive number' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    let completion;
    try {
      completion = await groq.chat.completions.create({
        messages,
        model,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      });
    } catch (apiError) {
      console.error('Groq API Error:', apiError);
      return NextResponse.json(
        { error: 'Failed to fetch completion from Groq API', details: process.env.NODE_ENV === 'development' ? apiError : undefined },
        { status: 502 }
      );
    }

    const responseContent = completion.choices?.[0]?.message?.content;
    if (!responseContent) {
      return NextResponse.json(
        { error: 'No response received from Groq API' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: responseContent,
      },
      usage: completion.usage,
    });

  } catch (error) {
    console.error('Unexpected Error:', error);

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}