# Role-Based Challenge Platform

A comprehensive frontend web application built with Next.js, featuring role-based authentication, an interactive chatbot, and a challenges management system. All powered by Firebase.

## 🚀 Features

### 1. **Role-Based Authentication**
- **Firebase Authentication** with Email/Password and Google Sign-In
- **Hierarchical Role System**: Admin, Moderator, and User roles
- **Role-based UI rendering** with restricted access controls
- **User profile management** with role assignments stored in Firestore

### 2. **Interactive Chatbot**
- **Real-time messaging** with Firebase Firestore integration
- **Smart FAQ responses** with keyword matching
- **Challenge notifications** (e.g., "You joined X Challenge")
- **Admin/Moderator FAQ management** capabilities
- **Persistent chat history** per user

### 3. **Challenges Module**
- **Create Challenges**: Public or private with invite codes
- **Join Challenges**: Direct joining for public, invite codes for private
- **Challenge Dashboard**: Track all challenges, progress, and leaderboards
- **Real-time updates** with Firebase Firestore
- **Role-based challenge management**

### 4. **Role-Based Dashboards**
- **User Dashboard**: View and join challenges, chat with bot
- **Moderator Dashboard**: Additional content management features
- **Admin Dashboard**: Full platform oversight and user role management

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **Language**: TypeScript
- **Deployment**: Firebase Hosting (ready)

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase project with Authentication and Firestore enabled
- Basic understanding of React and Next.js

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd role-based-app

# Install dependencies
npm install
```

### 2. Firebase Configuration

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one

2. **Enable Authentication**:
   - Go to Authentication > Sign-in method
   - Enable **Email/Password** authentication
   - Enable **Google** sign-in provider

3. **Set up Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Use the security rules provided below

4. **Get Firebase Configuration**:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click web app icon (`</>`) to add a web app
   - Copy the configuration values

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy the example file
cp env.example .env.local
```

Update `.env.local` with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

Add these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'moderator'];
    }
    
    // Chat messages - users can read/write their own messages
    match /chatMessages/{messageId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Challenges - public challenges readable by all, private by participants only
    match /challenges/{challengeId} {
      allow read: if request.auth != null && 
        (resource.data.type == 'public' || request.auth.uid in resource.data.participants);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.createdBy || request.auth.uid in resource.data.participants);
    }
    
    // FAQs - readable by all authenticated users, writable by admin/moderator
    match /faqs/{faqId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'moderator'];
    }
  }
}
```

## 🚀 Running the Application

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage Guide

### For Users
1. **Sign Up/Sign In**: Use email/password or Google authentication
2. **View Challenges**: Browse public challenges or join with invite codes
3. **Create Challenges**: Set up public or private challenges with custom parameters
4. **Chat with Bot**: Get help and receive notifications about challenge activities
5. **Track Progress**: Monitor your participation in various challenges

### For Moderators
- All user features plus:
- Content moderation capabilities
- FAQ management for the chatbot
- Enhanced challenge oversight

### For Admins
- All features plus:
- User role management
- Full platform administration
- System-wide oversight and controls

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── auth/             # Authentication components
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── App.tsx           # Main application component
│   ├── Dashboard.tsx     # Role-based dashboard
│   ├── Chatbot.tsx      # Chatbot interface
│   └── Challenges.tsx   # Challenge management
├── contexts/             # React contexts
│   └── AuthContext.tsx  # Authentication context
├── lib/                 # Utility libraries
│   └── firebase.ts     # Firebase configuration
└── types/              # TypeScript type definitions
    └── index.ts        # Application types
```

## 🔐 Security Features

- **Authentication**: Secure Firebase Authentication with multiple providers
- **Authorization**: Role-based access control throughout the application
- **Data Security**: Firestore security rules prevent unauthorized access
- **Client-side Protection**: Route guards and component-level permission checks

## 🚀 Deployment

### Firebase Hosting

1. **Install Firebase CLI**:
```bash
npm install -g firebase-tools
```

2. **Login and Initialize**:
```bash
firebase login
firebase init hosting
```

3. **Build and Deploy**:
```bash
npm run build
firebase deploy
```

### Vercel (Alternative)

```bash
npm run build
# Follow Vercel deployment instructions
```

## 🧪 Testing

```bash
# Run development server for testing
npm run dev

# Build for production testing
npm run build
npm start
```

## 📈 Performance Optimizations

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js built-in image optimization
- **Caching**: Firebase Firestore automatic caching
- **Lazy Loading**: React components loaded on demand

## 🔧 Customization

### Adding New Roles
1. Update the `User` type in `src/types/index.ts`
2. Modify role checks in components
3. Update Firestore security rules
4. Add role-specific UI elements

### Extending Chatbot Responses
1. Add FAQs through the admin interface
2. Modify the `findBestAnswer` function in `Chatbot.tsx`
3. Implement more sophisticated NLP if needed

### Challenge Types
1. Extend the `Challenge` type for new fields
2. Update the create challenge form
3. Modify challenge display components

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Configuration**: Ensure all environment variables are correctly set
2. **Authentication Errors**: Check Firebase project settings and enabled sign-in methods
3. **Firestore Permissions**: Verify security rules match your app's requirements
4. **Build Errors**: Ensure all dependencies are installed with `npm install`

### Error Logging
- Check browser console for client-side errors
- Monitor Firebase console for authentication and database issues
- Use Next.js error boundaries for graceful error handling

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js, Firebase, and Tailwind CSS**
