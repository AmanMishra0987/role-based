# Firebase Configuration

Please add your Firebase configuration to your environment variables. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Getting Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Click on the web app icon (`</>`) to add a web app
6. Copy the configuration values from the Firebase SDK snippet

## Firebase Services Setup

### Authentication
1. Go to Authentication > Sign-in method
2. Enable Email/Password authentication
3. Enable Google Sign-in provider

### Firestore Database
1. Go to Firestore Database
2. Create database in production mode
3. Set up security rules (provided in the project)

### Hosting (Optional)
1. Go to Hosting
2. Follow the setup instructions for deployment
