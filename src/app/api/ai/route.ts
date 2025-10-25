import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { type, content, pitchContext } = await request.json();

    if (!type || !content) {
      return NextResponse.json({ error: 'Type and content are required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    let prompt = '';
    let systemPrompt = '';

    switch (type) {
      case 'pitch_feedback':
        systemPrompt = `You are an experienced VC and pitch coach. You provide concise, actionable feedback on startup pitches. Focus on clarity, value proposition, market opportunity, and presentation skills. Be encouraging but honest. Keep responses under 150 words.`;
        
        prompt = `Please review this pitch and provide feedback: "${content}"
        
        ${pitchContext ? `Additional context: ${pitchContext}` : ''}
        
        Provide specific, actionable advice on how to improve this pitch.`;
        break;

      case 'question_generator':
        systemPrompt = `You are a venture capitalist who is interested in this startup. Generate thoughtful, challenging questions that a real investor would ask. Questions should test the founder's understanding of their business, market, and vision. Generate 3-5 questions.`;
        
        prompt = `Based on this pitch information: "${content}"
        
        Generate tough but fair questions that investors would likely ask.`;
        break;

      case 'pitch_improver':
        systemPrompt = `You are a professional pitch writer and communications expert. Help improve pitch content to make it more compelling, clear, and persuasive. Focus on strong opening hooks, clear value propositions, and powerful language. Keep the improved version concise and impactful.`;
        
        prompt = `Please improve this pitch content: "${content}"
        
        Make it more compelling and professional while maintaining the core message.`;
        break;

      case 'practice_partner':
        systemPrompt = `You are an investor conducting a pitch session. Respond naturally as an interested but skeptical investor. Ask follow-up questions, express concerns, and show engagement. Keep responses conversational and brief (2-3 sentences max).`;
        
        prompt = `The founder just said: "${content}"
        
        Respond as a real investor would in a pitch meeting.`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid AI service type' }, { status: 400 });
    }

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({
      success: true,
      response: aiResponse.trim(),
      type
    });

  } catch (error) {
    console.error('AI service error:', error);
    return NextResponse.json({ 
      error: 'Failed to process AI request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');

    if (service === 'status') {
      return NextResponse.json({
        status: 'active',
        services: ['pitch_feedback', 'question_generator', 'pitch_improver', 'practice_partner']
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  } catch (error) {
    console.error('AI status error:', error);
    return NextResponse.json({ error: 'Failed to get AI status' }, { status: 500 });
  }
}