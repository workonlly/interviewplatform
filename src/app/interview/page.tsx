// app/interview/page.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import  Vapi  from '@vapi-ai/web';
import Header from '../header'; // Make sure this path is correct
import { useAuth } from '../signup/authcontext'; // Make sure this path is correct
import { db } from '../firbase/client'; // Make sure this path is correct
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Get keys from environment variables or hardcode for testing
const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '1a8a9d7a-352a-46d4-9f6c-a4a7b4ac519d';
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "27b203dd-0268-4146-8b46-3a4ef057246a";

interface TranscriptMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  timestamp: Date;
}

interface StoredInterview {
  userId: string;
  transcript: TranscriptMessage[];
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  techStack: string;
  company: string;
  conclusion: string;
}

const InterviewPage = () => {
  const { user, loading } = useAuth();
  const [isCalling, setIsCalling] = useState(false);
  const [status, setStatus] = useState("Ready to start your interview");
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const userRef = useRef(user);
  const transcriptRef = useRef(transcript);
  const interviewStartTimeRef = useRef(interviewStartTime);

  // Update refs when state changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    interviewStartTimeRef.current = interviewStartTime;
  }, [interviewStartTime]);

  // Auto scroll to bottom of transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Save interview to Firestore
  const saveInterviewToFirestore = async (interviewData: StoredInterview) => {
    if (!user) return;

    try {
      setIsSaving(true);
      const docRef = await addDoc(collection(db, 'interviews'), {
        ...interviewData,
        createdAt: serverTimestamp(),
        transcript: interviewData.transcript.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        }))
      });
      console.log('Interview saved with ID: ', docRef.id);

      // Save summary to localStorage for the main page
      const interviewSummary = `${interviewData.company} - ${interviewData.techStack}\nCompleted on ${interviewData.endTime.toLocaleDateString()}\nDuration: ${interviewData.duration} minutes\nConclusion: ${interviewData.conclusion}`;
      localStorage.setItem('lastInterviewSummary', interviewSummary);

      setStatus("Interview saved successfully! 💾");
    } catch (error) {
      console.error('Error saving interview: ', error);
      setStatus("Interview completed but failed to save ❌");
    } finally {
      setIsSaving(false);
    }
  };

  // Generate interview conclusion based on performance
  const generateConclusion = (transcript: TranscriptMessage[], duration: number) => {
    const userMessages = transcript.filter(msg => msg.role === 'user').length;
    const avgResponseLength = userMessages > 0 ?
      transcript
        .filter(msg => msg.role === 'user')
        .reduce((acc, msg) => acc + msg.message.length, 0) / userMessages : 0;

    let conclusion = '';
    if (duration < 5) {
      conclusion = 'Short interview session - consider longer practice sessions.';
    } else if (userMessages < 5) {
      conclusion = 'Limited interaction - practice answering more questions.';
    } else if (avgResponseLength < 50) {
      conclusion = 'Brief responses - try to provide more detailed answers.';
    } else if (duration > 15 && userMessages > 10) {
      conclusion = 'Excellent practice session with good engagement.';
    } else {
      conclusion = 'Good practice session - keep practicing regularly.';
    }

    return conclusion;
  };

  useEffect(() => {
    if (!VAPI_PUBLIC_KEY || !ASSISTANT_ID) {
      setStatus("❌ Configuration error: Vapi keys are missing.");
      return;
    }

    // Initialize Vapi instance on component mount
    if (!vapiRef.current) {
      vapiRef.current = new Vapi(VAPI_PUBLIC_KEY);

      // Vapi event listeners
      vapiRef.current.on('call-start', () => {
        setIsCalling(true);
        setInterviewStartTime(new Date());
        setStatus("Interview in progress - Good luck! 🚀");
        addToTranscript('assistant', "Hello! I'm your AI interviewer. Let's begin your practice interview. Tell me about yourself.");
      });

      vapiRef.current.on('call-end', async () => {
        setIsCalling(false);
        setIsListening(false);

        const currentUser = userRef.current;
        const currentTranscript = transcriptRef.current;
        const currentStartTime = interviewStartTimeRef.current;
        
        if (currentUser && currentStartTime && currentTranscript.length > 0) {
          const endTime = new Date();
          const duration = Math.round((endTime.getTime() - currentStartTime.getTime()) / (1000 * 60)); // minutes
          const conclusion = generateConclusion(currentTranscript, duration);

          const interviewData: StoredInterview = {
            userId: currentUser.uid,
            transcript: currentTranscript,
            startTime: currentStartTime,
            endTime: endTime,
            duration: Math.max(duration, 1), // minimum 1 minute
            totalMessages: currentTranscript.length,
            userMessages: currentTranscript.filter(msg => msg.role === 'user').length,
            assistantMessages: currentTranscript.filter(msg => msg.role === 'assistant').length,
            techStack: 'General',
            company: 'Practice Session',
            conclusion: conclusion
          };

          setStatus("Saving interview... 💾");
          await saveInterviewToFirestore(interviewData);
        } else if (!currentUser) {
          setStatus("Interview completed. Sign in to save your progress.");
        } else {
          setStatus("Interview completed. Review your performance below.");
        }
      });

      vapiRef.current.on('speech-start', () => {
        setIsListening(false);
        setStatus("🤖 AI Interviewer is speaking...");
      });

      vapiRef.current.on('speech-end', () => {
        setIsListening(true);
        setStatus("🎤 Your turn to speak...");
      });

      vapiRef.current.on('message', (message: any) => {
        if (message.type === 'transcript' && message.transcript) {
          if (message.role === 'assistant') {
            addToTranscript('assistant', message.transcript);
          } else if (message.role === 'user') {
            addToTranscript('user', message.transcript);
          }
        }
      });

      vapiRef.current.on('error', (e: any) => {
        console.error("Vapi error:", e);
        setStatus(`❌ Error: ${e.message}`);
        setIsCalling(false);
        setIsListening(false);
      });
    }

    // Cleanup function to stop the call when the component unmounts
    return () => {
      if (vapiRef.current && isCalling) {
        vapiRef.current.stop();
      }
    };
  }, []); // Empty dependency array - only run once on mount

  const addToTranscript = (role: 'user' | 'assistant', message: string) => {
    const newMessage: TranscriptMessage = {
      id: Date.now().toString(),
      role,
      message,
      timestamp: new Date()
    };
    setTranscript(prev => [...prev, newMessage]);
  };

  const handleStartInterview = async () => {
    if (!user) {
      setStatus("❌ Please sign in to start an interview");
      return;
    }
    if (vapiRef.current && !isCalling) {
      try {
        setStatus("🔄 Connecting to your AI interviewer...");
        setTranscript([]); // Clear previous transcript
        setInterviewStartTime(null); // Reset start time
        await vapiRef.current.start(ASSISTANT_ID);
      } catch (error: any) {
        console.error("Failed to start Vapi call:", error);
        setStatus("❌ Failed to connect. " + (error.message || "Please check your network and Vapi configuration."));
      }
    }
  };

  const handleStopInterview = () => {
    if (vapiRef.current && isCalling) {
      setStatus("🔄 Ending interview...");
      vapiRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript([]);
    setInterviewStartTime(null);
    setStatus("Ready to start your interview");
  };
  
  if (loading) {
    return (
      <div className='p-1 h-screen overflow-hidden'>
        <div className='bg-black/90 h-full rounded-xl shadow-md flex flex-col justify-center items-center'>
          <div className='text-white text-lg'>Loading...</div>
        </div>
      </div>
    );
  }

  // The JSX remains the same as your provided code
  return (
    <div className='p-1 h-screen overflow-hidden'>
      <div className='bg-black/90 h-full rounded-xl shadow-md flex flex-col justify-start p-2'>
        <div className='block w-full mb-2'>
          <Header />
        </div>
        <div className='flex gap-4 h-full overflow-hidden'>
          {/* Left Panel - Controls */}
          <div className='bg-black shadow-[inset_0_0_10px_rgba(0,0,0,0.4)] shadow-white rounded-md w-80 p-4 flex flex-col'>
            <div className='flex items-center justify-start text-3xl mb-3'>🤼‍♂️</div>
            <div className='flex flex-col gap-4 text-white h-full'>
              <h2 className='text-xl font-bold'>AI Interview Practice</h2>
              <div className='bg-gray-800/50 rounded-lg p-3'>
                <p className='text-sm text-gray-300 mb-2'>Status:</p>
                <p className='text-sm font-medium'>{status}</p>
                {isListening && (
                  <div className='flex items-center gap-2 mt-2'>
                    <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></div>
                    <span className='text-xs text-red-400'>Listening...</span>
                  </div>
                )}
                {isSaving && (
                  <div className='flex items-center gap-2 mt-2'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
                    <span className='text-xs text-blue-400'>Saving...</span>
                  </div>
                )}
              </div>

              {/* User Info */}
              {user && (
                <div className='bg-green-900/30 border border-green-700/30 rounded-lg p-3 text-sm'>
                  <p className='text-green-300'>👤 Signed in as:</p>
                  <p className='text-white font-medium'>{user.displayName || user.email?.split('@')[0]}</p>
                  <p className='text-green-400 text-xs mt-1'>✅ Interviews will be saved</p>
                </div>
              )}
              {!user && (
                <div className='bg-yellow-900/30 border border-yellow-700/30 rounded-lg p-3 text-sm'>
                  <p className='text-yellow-300'>⚠️ Not signed in</p>
                  <p className='text-white text-xs mt-1'>Sign in to save your interview progress</p>
                </div>
              )}
              <div className='flex flex-col gap-3'>
                {isCalling ? (
                  <button 
                    onClick={handleStopInterview} 
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600 text-sm"
                    disabled={status.includes("Ending")}
                  >
                    🛑 End Interview
                  </button>
                ) : (
                  <button 
                    onClick={handleStartInterview} 
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600 text-sm"
                    disabled={status.includes("Connecting") || !VAPI_PUBLIC_KEY || !ASSISTANT_ID || loading}
                  >
                    🚀 Start Interview
                  </button>
                )}
                {transcript.length > 0 && !isCalling && (
                  <button 
                    onClick={clearTranscript}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                  >
                    🗑️ Clear Transcript
                  </button>
                )}
              </div>
              <div className='bg-blue-900/30 rounded-lg p-3 text-xs text-blue-200'>
                <h3 className='font-bold mb-2'>💡 Tips:</h3>
                <ul className='space-y-1'>
                  <li>• Speak clearly and at a normal pace</li>
                  <li>• Wait for the AI to finish before responding</li>
                  <li>• Practice common interview questions</li>
                  <li>• Review your transcript after the interview</li>
                </ul>
              </div>
            </div>
          </div>
          {/* Right Panel - Transcript */}
          <div className='bg-black shadow-[inset_0_0_10px_rgba(0,0,0,0.4)] shadow-white rounded-md flex-1 p-4 flex flex-col'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-white text-lg font-bold'>📝 Interview Transcript</h3>
              <div className='flex items-center gap-3 text-sm'>
                {transcript.length > 0 && (
                  <span className='text-gray-400'>
                    {transcript.length} messages
                  </span>
                )}
                {user && interviewStartTime && (
                  <span className='text-green-400'>
                    💾 Auto-saving
                  </span>
                )}
              </div>
            </div>
            <div className='flex-1 overflow-y-auto bg-gray-900/50 rounded-lg p-4 space-y-3'>
              {transcript.length === 0 ? (
                <div className='text-gray-400 text-center py-8'>
                  <div className='text-4xl mb-4'>💬</div>
                  <p>Your interview conversation will appear here</p>
                  <p className='text-sm mt-2'>Start an interview to begin practicing!</p>
                </div>
              ) : (
                transcript.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='text-xs font-medium'>
                          {message.role === 'user' ? '🧑‍💼 You' : '🤖 AI Interviewer'}
                        </span>
                        <span className='text-xs opacity-70'>
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className='text-sm'>{message.message}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;