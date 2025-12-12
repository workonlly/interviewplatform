"use client";


import React, { useState } from 'react';
import { signUpWithEmail } from './auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { user, error } = await signUpWithEmail(
        formData.email,
        formData.password,
        formData.fullName
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black/90 backdrop-blur-xs p-6 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🤼</div>
          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-300">Join prep.ii to start practicing interviews</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          <div>
            <label className="block text-white text-sm font-medium mb-2">FULL NAME</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:border-black"
              placeholder="Enter your full name"
              required
            />
          </div>
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
              placeholder="Create a password"
              required
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">CONFIRM PASSWORD</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:border-black"
              placeholder="Confirm your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-gray-300 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-white hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
