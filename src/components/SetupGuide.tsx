'use client';

import React from 'react';
import { isFirebaseConfigured } from '@/lib/firebase';
import { AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';

export default function SetupGuide() {
  const isConfigured = isFirebaseConfigured();

  if (isConfigured) {
    return null; // Don't show setup guide if Firebase is configured
  }

  const envContent = `# Firebase Configuration
# Get these values from your Firebase project settings
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envContent);
    alert('Environment variables copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mr-2 sm:mr-3" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Firebase Setup Required</h1>
          </div>
          
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800">
                <strong>Note:</strong> This application requires Firebase configuration to function properly. 
                Please follow the steps below to set up your Firebase project.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 1: Create Firebase Project</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500 inline-flex items-center">
                  Firebase Console <ExternalLink className="h-4 w-4 ml-1" />
                </a></li>
                <li>Click &quot;Create a project&quot; or select an existing project</li>
                <li>Follow the setup wizard to create your project</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 2: Enable Authentication</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>In your Firebase project, go to <strong>Authentication</strong></li>
                <li>Click on <strong>Sign-in method</strong> tab</li>
                <li>Enable <strong>Email/Password</strong> authentication</li>
                <li>Enable <strong>Google</strong> sign-in provider</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 3: Set up Firestore Database</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to <strong>Firestore Database</strong></li>
                <li>Click &quot;Create database&quot;</li>
                <li>Choose &quot;Start in production mode&quot;</li>
                <li>Select a location for your database</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 4: Get Firebase Configuration</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to <strong>Project Settings</strong> (gear icon)</li>
                <li>Scroll down to &quot;Your apps&quot; section</li>
                <li>Click the web app icon (<code className="bg-gray-100 px-1 rounded">&lt;/&gt;</code>)</li>
                <li>Register your app with a name (e.g., &quot;Role-Based App&quot;)</li>
                <li>Copy the configuration values</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 5: Create Environment File</h2>
              <p className="text-gray-700">Create a <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file in the root directory with the following content:</p>
              
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <pre className="text-green-400 text-sm overflow-x-auto">
                  <code>{envContent}</code>
                </pre>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600">
                Replace the placeholder values with your actual Firebase configuration values.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 6: Set up Firestore Security Rules</h2>
              <p className="text-gray-700">In your Firestore console, go to <strong>Rules</strong> and replace the default rules with:</p>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-green-400 text-sm overflow-x-auto">
                  <code>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'moderator'];
    }
    
    match /chatMessages/{messageId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /challenges/{challengeId} {
      allow read: if request.auth != null && 
        (resource.data.type == 'public' || request.auth.uid in resource.data.participants);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.createdBy || request.auth.uid in resource.data.participants);
    }
    
    match /faqs/{faqId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'moderator'];
    }
  }
}`}</code>
                </pre>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step 7: Restart the Application</h2>
              <p className="text-gray-700">After setting up the environment variables:</p>
              <div className="bg-gray-100 rounded-lg p-4">
                <code className="text-gray-800">npm run dev</code>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-800">
                  <strong>Once configured:</strong> The application will automatically detect your Firebase configuration and show the login/signup interface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
