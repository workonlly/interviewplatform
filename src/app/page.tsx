'use client';
import React from 'react'
import Header from './header'
import Link from 'next/link'
import { useAuth } from './signup/authcontext'

function Page() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className='p-1 h-screen overflow-hidden'>
        <div className='bg-black/90 h-full rounded-xl shadow-md flex flex-col justify-center items-center'>
          <div className='text-white text-lg'>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen p-1 md:p-4'>
      <div className='bg-black/90 min-h-screen md:min-h-[calc(100vh-2rem)] rounded-xl shadow-md flex flex-col'>
        {/* Header */}
        <div className='w-full p-2'>
          <Header />
        </div>

        {/* Main Content */}
        <div className='flex-1 flex items-center justify-center p-4 md:p-8'>
          <div className='w-full max-w-lg mx-auto'>
            <div className='bg-black shadow-[inset_0_0_10px_rgba(0,0,0,0.4)] shadow-white rounded-xl p-6 md:p-8'>
              <div className='text-center space-y-6'>
                {/* Logo/Icon */}
                <div className='flex items-center justify-center'>
                  <div className='text-4xl md:text-6xl mb-2'>🤼‍♂️</div>
                </div>
                
                {/* Title */}
                <div className='space-y-2'>
                  <h1 className='text-2xl md:text-3xl font-bold text-white leading-tight'>
                    AI Interview Practice
                  </h1>
                  <p className='text-base md:text-lg text-gray-300 leading-relaxed'>
                    Get interview-ready with AI-powered practice sessions and instant feedback
                  </p>
                </div>

                {/* User-specific content */}
                {user ? (
                  <div className='space-y-4'>
                    {/* Welcome Message */}
                    <div className='bg-green-900/30 border border-green-700/30 rounded-lg p-3 text-green-300 text-sm'>
                      <p className='font-medium'>👤 Welcome, {user.displayName || user.email?.split('@')[0]}!</p>
                      <p className='text-xs mt-1 text-green-400'>Ready to practice your interview skills?</p>
                    </div>
                    
                    {/* Main CTA Button */}
                    <Link
                      href='/interview'
                      className='block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 md:py-5 px-6 rounded-lg transition-all duration-200 text-lg md:text-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                    >
                      🚀 Start Interview Practice
                    </Link>
                    
                    {/* Features List */}
                    <div className='bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 text-blue-200 text-sm'>
                      <h3 className='font-bold mb-3 text-blue-100'>💡 What you'll get:</h3>
                      <ul className='space-y-2 text-left'>
                        <li className='flex items-start gap-2'>
                          <span className='text-blue-400 mt-0.5'>•</span>
                          <span>Real-time AI interview simulation</span>
                        </li>
                        <li className='flex items-start gap-2'>
                          <span className='text-blue-400 mt-0.5'>•</span>
                          <span>Practice with different tech stacks</span>
                        </li>
                        <li className='flex items-start gap-2'>
                          <span className='text-blue-400 mt-0.5'>•</span>
                          <span>Target specific companies</span>
                        </li>
                        <li className='flex items-start gap-2'>
                          <span className='text-blue-400 mt-0.5'>•</span>
                          <span>Instant performance feedback</span>
                        </li>
                        <li className='flex items-start gap-2'>
                          <span className='text-blue-400 mt-0.5'>•</span>
                          <span>Full transcript recording</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {/* Sign-in prompt */}
                    <div className='bg-yellow-900/30 border border-yellow-700/30 rounded-lg p-3 text-yellow-300 text-sm'>
                      <p className='font-medium'>⚠️ Please sign in to start practicing</p>
                    </div>
                    
                    {/* Auth Buttons */}
                    <div className='space-y-3'>
                      <Link
                        href='/login'
                        className='block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 md:py-4 px-6 rounded-lg transition-all duration-200 text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                      >
                        🔑 Sign In
                      </Link>
                      
                      <Link
                        href='/signup'
                        className='block w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 md:py-4 px-6 rounded-lg transition-all duration-200 text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                      >
                        📝 Create Account
                      </Link>
                    </div>
                    
                    {/* Benefits */}
                    <div className='bg-gray-800/40 border border-gray-700/30 rounded-lg p-4 text-gray-300 text-sm'>
                      <h3 className='font-bold mb-3 text-gray-100'>Why sign up?</h3>
                      <ul className='space-y-2 text-left'>
                        <li className='flex items-start gap-2'>
                          <span className='text-gray-400 mt-0.5'>•</span>
                          <span>Save your interview progress</span>
                        </li>
                        <li className='flex items-start gap-2'>
                          <span className='text-gray-400 mt-0.5'>•</span>
                          <span>Track your improvement</span>
                        </li>
                        <li className='flex items-start gap-2'>
                          <span className='text-gray-400 mt-0.5'>•</span>
                          <span>Access personalized feedback</span>
                        </li>
                        <li className='flex items-start gap-2'>
                          <span className='text-gray-400 mt-0.5'>•</span>
                          <span>View interview history</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
