import React from 'react'
import { useAuth } from './signup/authcontext'
import { signOutUser } from './signup/auth'
import Link from 'next/link'

function Header() {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    await signOutUser();
  };

  if (loading) {
    return (
      <div className='w-full flex justify-center'>
        <div className='rounded-full w-[100%] h-[45px] shadow-2xl shadow-white/60 bg-black flex items-center'>
          <div className='relative w-full pl-[25px] h-[35px] flex items-center justify-between'>
            <div className='text-white font-bold italic'>🤼‍♂️ PREP...</div>
            <div className='text-white text-sm mr-[25px]'>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full flex justify-center'>
      <div className='rounded-full w-[100%] h-[45px] shadow-2xl shadow-white/60 bg-black flex items-center'>
        <div className='relative w-full pl-[25px] h-[35px] flex items-center justify-between'>
          <div className='text-white font-bold italic'>🤼‍♂️ PREP...</div>
          
          {user ? (
            <div className='flex items-center gap-3 mr-[25px]'>
              <span className='text-white text-sm'>
                Welcome, {user.displayName || user.email?.split('@')[0]}!
              </span>
              <button
                onClick={handleSignOut}
                className='text-white text-sm hover:text-gray-300 underline'
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className='flex items-center gap-3 mr-[25px]'>
              <Link href="/login" className='text-white text-sm hover:text-gray-300 underline'>
                Log In
              </Link>
              <Link href="/signup" className='text-white text-sm hover:text-gray-300 underline'>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Header
