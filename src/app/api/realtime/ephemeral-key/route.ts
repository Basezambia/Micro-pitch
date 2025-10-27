import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Create session configuration for real-time transcription
    const sessionConfig = {
      session: {
        type: "realtime",
        model: "gpt-4o-realtime-preview-2024-10-01",
        audio: {
          output: { voice: "alloy" }
        }
      }
    };

    // Generate ephemeral key from OpenAI
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionConfig),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate ephemeral key' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      ephemeral_key: data.value,
      expires_at: data.expires_at
    });

  } catch (error) {
    console.error('Error generating ephemeral key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}