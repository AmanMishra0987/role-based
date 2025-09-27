'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isFirebaseConfigured } from '@/lib/firebase';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import Dashboard from '@/components/Dashboard';
import SetupGuide from '@/components/SetupGuide';
import FloatingChatbot from '@/components/FloatingChatbot';

export default function App() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState('challenges');

  // Show setup guide if Firebase is not configured
  if (!isFirebaseConfigured()) {
    return <SetupGuide />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {authMode === 'login' ? <LoginForm /> : <SignupForm />}
        
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <p className="text-sm text-gray-600">
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {authMode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} />
      <FloatingChatbot />
    </>
  );
}
