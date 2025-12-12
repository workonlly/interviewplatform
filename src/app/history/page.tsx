'use client';

import React, { useEffect, useState } from 'react';
import Header from '../header';
import { useAuth } from '../signup/authcontext';
import { db } from '../firbase/client';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

interface TranscriptMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  timestamp: string;
}

interface StoredInterview {
  id: string;
  userId: string;
  transcript: TranscriptMessage[];
  startTime: any;
  endTime: any;
  duration: number;
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  createdAt: any;
}

const InterviewHistoryPage = () => {
  const { user, loading } = useAuth();
  const [interviews, setInterviews] = useState<StoredInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<StoredInterview | null>(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'interviews'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const interviewData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as StoredInterview[];
        
        setInterviews(interviewData);
      } catch (error) {
        console.error('Error fetching interviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, [user]);

  if (loading) {
    return (
      <div className='p-1 h-screen overflow-hidden'>
        <div className='bg-black/90 h-full rounded-xl shadow-md flex flex-col justify-center items-center'>
          <div className='text-white text-lg'>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='p-1 h-screen overflow-hidden'>
        <div className='bg-black/90 h-full rounded-xl shadow-md flex flex-col justify-start p-2'>
          <div className='block w-full mb-2'>
            <Header />
          </div>
          <div className='bg-black shadow-[inset_0_0_10px_rgba(0,0,0,0.4)] shadow-white rounded-md w-full h-auto mt-2 p-3 flex flex-col items-center justify-center'>
            <div className='text-4xl mb-4'>🔒</div>
            <h2 className='text-white text-xl font-bold mb-2'>Sign In Required</h2>
            <p className='text-gray-300 text-center'>Please sign in to view your interview history.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-1 h-screen overflow-hidden'>
      <div className='bg-black/90 h-full rounded-xl shadow-md flex flex-col justify-start p-2'>
        <div className='block w-full mb-2'>
          <Header />
        </div>

        <div className='flex gap-4 h-full overflow-hidden'>
          {/* Left Panel - Interview List */}
          <div className='bg-black shadow-[inset_0_0_10px_rgba(0,0,0,0.4)] shadow-white rounded-md w-80 p-4 flex flex-col'>
            <div className='flex items-center justify-start text-3xl mb-3'>📚</div>
            
            <div className='flex flex-col gap-4 text-white h-full'>
              <h2 className='text-xl font-bold'>Interview History</h2>
              
              <div className='bg-gray-800/50 rounded-lg p-3'>
                <p className='text-sm text-gray-300 mb-2'>Total Interviews:</p>
                <p className='text-lg font-bold text-blue-400'>{interviews.length}</p>
              </div>

              <div className='flex-1 overflow-y-auto space-y-2'>
                {isLoading ? (
                  <div className='text-center text-gray-400 py-4'>Loading interviews...</div>
                ) : interviews.length === 0 ? (
                  <div className='text-center text-gray-400 py-4'>
                    <div className='text-2xl mb-2'>📝</div>
                    <p>No interviews yet</p>
                    <p className='text-xs mt-1'>Complete an interview to see it here</p>
                  </div>
                ) : (
                  interviews.map((interview) => (
                    <div
                      key={interview.id}
                      onClick={() => setSelectedInterview(interview)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedInterview?.id === interview.id
                          ? 'bg-blue-600'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <div className='text-sm font-medium'>
                        {new Date(interview.createdAt?.toDate?.() || interview.createdAt).toLocaleDateString()}
                      </div>
                      <div className='text-xs text-gray-300 mt-1'>
                        Duration: {interview.duration} min
                      </div>
                      <div className='text-xs text-gray-300'>
                        Messages: {interview.totalMessages}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Interview Transcript */}
          <div className='bg-black shadow-[inset_0_0_10px_rgba(0,0,0,0.4)] shadow-white rounded-md flex-1 p-4 flex flex-col'>
            {selectedInterview ? (
              <>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-white text-lg font-bold'>📝 Interview Transcript</h3>
                  <div className='text-gray-400 text-sm'>
                    {new Date(selectedInterview.createdAt?.toDate?.() || selectedInterview.createdAt).toLocaleString()}
                  </div>
                </div>
                
                <div className='bg-gray-800/50 rounded-lg p-3 mb-4 text-sm text-white'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <span className='text-gray-300'>Duration: </span>
                      <span className='font-medium'>{selectedInterview.duration} minutes</span>
                    </div>
                    <div>
                      <span className='text-gray-300'>Total Messages: </span>
                      <span className='font-medium'>{selectedInterview.totalMessages}</span>
                    </div>
                    <div>
                      <span className='text-gray-300'>Your Messages: </span>
                      <span className='font-medium'>{selectedInterview.userMessages}</span>
                    </div>
                    <div>
                      <span className='text-gray-300'>AI Messages: </span>
                      <span className='font-medium'>{selectedInterview.assistantMessages}</span>
                    </div>
                  </div>
                </div>
                
                <div className='flex-1 overflow-y-auto bg-gray-900/50 rounded-lg p-4 space-y-3'>
                  {selectedInterview.transcript.map((message, index) => (
                    <div
                      key={index}
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
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className='text-sm'>{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className='flex-1 flex flex-col items-center justify-center text-gray-400'>
                <div className='text-4xl mb-4'>👆</div>
                <p className='text-lg'>Select an interview to view</p>
                <p className='text-sm mt-2'>Choose from your interview history on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewHistoryPage;
