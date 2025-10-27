'use client';

import { useState, useRef, useEffect } from 'react';
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Phone, PhoneOff, Loader2, AlertCircle } from 'lucide-react';

interface VoiceAgentProps {
  className?: string;
  promptId?: string;
  transcriptContext?: string;
  onTranscript?: (transcript: string) => void;
  onAIResponse?: (response: string) => void;
}

export default function VoiceAgent({ className, promptId, transcriptContext, onTranscript, onAIResponse }: VoiceAgentProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const agentRef = useRef<RealtimeAgent | null>(null);
  const sessionRef = useRef<RealtimeSession | null>(null);

  const connectToAgent = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Fetch voice token from API
      const response = await fetch('/api/voice-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-realtime-preview-2024-10-01'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error?.includes('OpenAI API key not configured')) {
          throw new Error('Voice coaching is currently unavailable. Please configure your OpenAI API key to enable this feature.');
        }
        throw new Error(errorData.error || 'Failed to get voice token');
      }
      
      const { client_secret } = await response.json();
      
      // Initialize RealtimeAgent with correct configuration
      const agent = new RealtimeAgent({
        name: 'pitch-coach',
        instructions: promptId ? `Use prompt ID: ${promptId}` : `You are an expert AI pitch coach specializing in startup presentations. Your role is to provide detailed, actionable feedback on pitch delivery, pronunciation, tone, and overall presentation quality.

${transcriptContext ? `CONTEXT: The user just completed a pitch practice session. Here is their transcript: "${transcriptContext}"

Based on this transcript, provide comprehensive feedback on:` : 'When the user speaks, analyze and provide feedback on:'}

1. PRONUNCIATION & ARTICULATION:
   - Identify any words that may have been mispronounced or unclear
   - Suggest proper pronunciation with phonetic guidance
   - Point out articulation issues and provide exercises

2. TONE & DELIVERY:
   - Assess confidence level and energy
   - Evaluate pace and rhythm
   - Suggest improvements for vocal variety and emphasis

3. CONTENT STRUCTURE:
   - Analyze the logical flow of ideas
   - Identify missing key elements (problem, solution, market, etc.)
   - Suggest improvements for clarity and impact

4. SPECIFIC WORD COACHING:
   - Break down challenging technical terms
   - Provide alternative phrasing for better audience understanding
   - Suggest power words to enhance persuasion

${transcriptContext ? `Start by immediately providing detailed feedback on their practice session, then engage in interactive coaching to help them improve specific areas.` : 'Be proactive in offering specific, actionable advice. Ask clarifying questions to better understand their pitch and provide targeted coaching.'}

Always be encouraging while providing honest, constructive feedback. Focus on practical improvements they can implement immediately.`,
        voice: 'alloy'
      });
      
      // Initialize RealtimeSession with correct parameters
      const session = new RealtimeSession(agent, {
        apiKey: client_secret,
        transport: 'websocket'
      });
      
      // Set up event listeners with correct event types
      session.on('transport_event', (event) => {
        if (event.type === 'session.created') {
          console.log('Connected to voice agent');
          setIsConnected(true);
          setIsConnecting(false);
        } else if (event.type === 'session.updated') {
          console.log('Session updated');
        } else if (event.type === 'error') {
          console.error('Transport error:', event.error);
          setError('Connection error occurred');
          setIsConnecting(false);
          setIsConnected(false);
        }
      });
      
      session.on('error', (error) => {
        console.error('Voice agent error:', error);
        setError(error.error?.toString() || 'Unknown error occurred');
        setIsConnecting(false);
        setIsConnected(false);
      });
      
      // Handle history updates for transcription
      session.on('history_updated', (history) => {
        const lastItem = history[history.length - 1];
        if (lastItem && lastItem.type === 'message' && lastItem.role === 'user') {
          const transcriptText = lastItem.content?.[0]?.text || '';
          setTranscript(transcriptText);
          onTranscript?.(transcriptText);
        }
      });
      
      // Handle agent responses
      session.on('agent_end', (context, agent, output) => {
        setAiResponse(output);
        onAIResponse?.(output);
      });
      
      agentRef.current = agent;
      sessionRef.current = session;
      
      // Connect to the session
      await session.connect({
        model: 'gpt-4o-realtime-preview-2024-10-01',
        apiKey: client_secret
      });

      // If we have transcript context, automatically start the coaching session
      if (transcriptContext && transcriptContext.trim()) {
        // Wait a moment for the connection to stabilize, then provide the context
        setTimeout(() => {
          if (sessionRef.current && isConnected) {
            // The RealtimeSession will automatically handle the transcript context
            // through the agent's system prompt and conversation flow
            console.log('Starting coaching session with transcript context');
            
            // Set the AI response with the transcript context for immediate feedback
            const contextualResponse = `I've received your pitch practice session. Let me provide detailed feedback on your delivery: "${transcriptContext}". I'll analyze your pronunciation, tone, and overall presentation effectiveness.`;
            setAiResponse(contextualResponse);
            onAIResponse?.(contextualResponse);
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('Failed to connect to voice agent:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect');
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    agentRef.current = null;
    sessionRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
    setTranscript('');
    setAiResponse('');
    setError(null);
  };

  const toggleMute = () => {
    if (sessionRef.current) {
      sessionRef.current.mute(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.close();
      }
    };
  }, []);

  return (
    <div className={`voice-agent-container ${className || ''}`}>
      <div className="flex flex-col items-center space-y-6 p-6 bg-white rounded-lg shadow-lg">
        {/* Connection Controls */}
        <div className="flex items-center space-x-4">
          {!isConnected ? (
            <motion.button
              onClick={connectToAgent}
              disabled={isConnecting}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isConnecting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Phone className="w-5 h-5" />
              )}
              <span>{isConnecting ? 'Connecting...' : 'Connect to AI Coach'}</span>
            </motion.button>
          ) : (
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={disconnect}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PhoneOff className="w-5 h-5" />
                <span>Disconnect</span>
              </motion.button>
              
              <motion.button
                onClick={toggleMute}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  isMuted 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
          </span>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-md"
            >
              <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transcript Display */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-md"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Speech:</h3>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">{transcript}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Response Display */}
        <AnimatePresence>
          {aiResponse && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-md"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-2">AI Coach Response:</h3>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">{aiResponse}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-md text-center"
          >
            <p className="text-sm text-gray-600">
              Start speaking to practice your pitch. The AI coach will listen and provide feedback.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}