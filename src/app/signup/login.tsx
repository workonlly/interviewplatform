
'use client';

import React, { useState } from 'react';
import { signInWithEmail } from './auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, error } = await signInWithEmail(
        formData.email,
        formData.password
      );
      if (error) {
        setError(error);
      } else if (user) {
        router.push('/');
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-black/90 backdrop-blur-xs p-6 rounded-lg shadow-lg mx-auto mt-10">
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">🤼</div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-gray-300">Log in to continue your practice</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        <div>
          <label className="block text-white text-sm font-medium mb-2">EMAIL</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:border-black"
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label className="block text-white text-sm font-medium mb-2">PASSWORD</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:border-black"
            placeholder="Enter your password"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <p className="text-center text-gray-300 mt-4">
        Don't have an account?{' '}
        <Link href="/signup" className="text-white hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
