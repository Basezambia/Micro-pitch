import { NextRequest, NextResponse } from 'next/server';
import WebSocket from 'ws';

// Store active WebSocket connections for sideband control
const activeConnections = new Map<string, WebSocket>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Realtime webhook received:', JSON.stringify(body, null, 2));

    const { call_id, event_type, data } = body;

    if (!call_id) {
      return NextResponse.json(
        { error: 'Missing call_id in webhook payload' },
        { status: 400 }
      );
    }

    // Handle different webhook event types
    switch (event_type) {
      case 'call.started':
        await handleCallStarted(call_id, data);
        break;
      
      case 'call.ended':
        await handleCallEnded(call_id, data);
        break;
      
      case 'transcription.completed':
        await handleTranscriptionCompleted(call_id, data);
        break;
      
      case 'error':
        await handleError(call_id, data);
        break;
      
      default:
        console.log(`Unhandled webhook event type: ${event_type}`);
    }

    return NextResponse.json({ status: 'received' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCallStarted(callId: string, data: any) {
  console.log(`Call started: ${callId}`, data);
  
  try {
    // Connect to OpenAI Realtime API via sideband WebSocket
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return;
    }

    const wsUrl = `wss://api.openai.com/v1/realtime?call_id=${callId}`;
    const ws = new WebSocket(wsUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    ws.on('open', () => {
      console.log(`Connected to OpenAI Realtime sideband for call: ${callId}`);
      
      // Store the connection
      activeConnections.set(callId, ws);
      
      // Send initial session configuration
      ws.send(JSON.stringify({
        type: 'session.update',
        session: {
          instructions: 'You are a helpful assistant providing real-time transcription. Transcribe all audio input clearly and accurately. Focus on providing clean, readable transcripts.',
          voice: 'alloy',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1'
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500
          },
          temperature: 0.3,
          max_response_output_tokens: 4096
        },
      }));
    });

    ws.on('message', (message) => {
      try {
        const event = JSON.parse(message.toString());
        console.log(`Sideband event for ${callId}:`, event.type);
        
        // Handle specific events
        switch (event.type) {
          case 'conversation.item.input_audio_transcription.completed':
            console.log(`Transcription: ${event.transcript}`);
            // You could store this in a database or forward to other services
            break;
          
          case 'error':
            console.error(`Realtime API error for ${callId}:`, event.error);
            break;
        }
      } catch (err) {
        console.error('Error parsing sideband message:', err);
      }
    });

    ws.on('error', (error) => {
      console.error(`Sideband WebSocket error for ${callId}:`, error);
      activeConnections.delete(callId);
    });

    ws.on('close', () => {
      console.log(`Sideband connection closed for call: ${callId}`);
      activeConnections.delete(callId);
    });

  } catch (error) {
    console.error(`Error setting up sideband for call ${callId}:`, error);
  }
}

async function handleCallEnded(callId: string, data: any) {
  console.log(`Call ended: ${callId}`, data);
  
  // Close sideband connection if it exists
  const ws = activeConnections.get(callId);
  if (ws) {
    ws.close();
    activeConnections.delete(callId);
  }
}

async function handleTranscriptionCompleted(callId: string, data: any) {
  console.log(`Transcription completed for call: ${callId}`, data);
  
  // You could store the final transcription in a database here
  // Example: await storeTranscription(callId, data.transcript);
}

async function handleError(callId: string, data: any) {
  console.error(`Error for call ${callId}:`, data);
  
  // Clean up connection on error
  const ws = activeConnections.get(callId);
  if (ws) {
    ws.close();
    activeConnections.delete(callId);
  }
}

// Utility function to send control messages to active sessions
export async function sendControlMessage(callId: string, message: any) {
  const ws = activeConnections.get(callId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
    return true;
  }
  return false;
}

// GET endpoint to check webhook status
export async function GET() {
  return NextResponse.json({
    status: 'active',
    active_connections: activeConnections.size,
    timestamp: new Date().toISOString()
  });
}