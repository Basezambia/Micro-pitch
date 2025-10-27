import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '' || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Create FormData for OpenAI API
    const openaiFormData = new FormData();
    openaiFormData.append('file', audioFile);
    openaiFormData.append('model', 'whisper-1');
    openaiFormData.append('response_format', 'json');
    openaiFormData.append('language', 'en');

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI Whisper API error:', error);
      return NextResponse.json(
        { error: 'Failed to transcribe audio' },
        { status: response.status }
      );
    }

    const transcription = await response.json();
    
    return NextResponse.json({
      success: true,
      transcript: transcription.text,
    });

  } catch (error) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}