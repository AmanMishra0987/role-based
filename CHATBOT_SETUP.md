# Chatbot Widget with Gemini AI Integration

This chatbot widget provides intelligent responses using Google's Gemini AI API and includes notification features for challenge updates.

## Features

- **Intelligent Responses**: Uses Gemini AI for contextual and helpful responses
- **FAQ Management**: Admin/Moderator can manage FAQ responses stored in Firestore
- **Challenge Notifications**: Automatic notifications when users join/leave/create challenges
- **Floating Widget**: Can be used as a floating widget or embedded component
- **Role-based Access**: Different features available based on user role

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to your `.env.local` file

### 3. Firestore Collections

The chatbot uses the following Firestore collections:

- `chatMessages`: Stores chat messages and notifications
- `faqs`: Stores FAQ questions and answers for admin management

### 4. Firestore Indexes (Optional)

For optimal performance, you can create composite indexes in Firestore:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database → Indexes
4. Create the following composite index:

**Collection:** `chatMessages`
**Fields:**
- `userId` (Ascending)
- `timestamp` (Ascending)

**Collection:** `faqs`
**Fields:**
- `category` (Ascending)
- `updatedAt` (Descending)

**Note:** The chatbot will work without these indexes, but they improve query performance for large datasets.

### 5. Usage

#### Floating Widget
```tsx
import FloatingChatbot from '@/components/FloatingChatbot';

// Add to your main app component
<FloatingChatbot />
```

#### Embedded Component
```tsx
import Chatbot from '@/components/Chatbot';

// Use as embedded component
<Chatbot />
```

#### Sending Challenge Notifications
```tsx
import { notifyChallengeJoined } from '@/lib/notifications';

// When a user joins a challenge
await notifyChallengeJoined(userId, challengeTitle, challengeId);
```

### 6. Admin Features

Admin and Moderator users can:
- View and manage FAQ responses
- Access FAQ management through the dashboard
- See FAQ settings in the chatbot widget

### 7. Components

- `Chatbot.tsx`: Main chatbot component with Gemini AI integration
- `FloatingChatbot.tsx`: Floating widget wrapper
- `FAQManagement.tsx`: Admin interface for FAQ management
- `gemini.ts`: Gemini AI service integration
- `notifications.ts`: Challenge notification utilities

## API Integration

The chatbot uses Google's Gemini Pro model for generating responses. It includes:
- Context-aware responses based on user role and platform features
- Fallback responses for common queries
- Intelligent FAQ matching
- Challenge notification generation

## Customization

You can customize the chatbot by:
- Modifying the prompt in `gemini.ts`
- Adding new FAQ categories
- Updating notification templates
- Styling the widget appearance
