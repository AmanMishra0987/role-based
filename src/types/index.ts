export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'moderator' | 'user';
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'public' | 'private';
  inviteCode?: string;
  startDate: Date;
  endDate: Date;
  createdBy: string;
  createdAt: Date;
  participants: string[];
  maxParticipants?: number;
  status: 'active' | 'completed' | 'cancelled';
}

export interface ChallengeParticipant {
  userId: string;
  challengeId: string;
  joinedAt: Date;
  progress: number;
  score: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: Date;
  type: 'user' | 'bot' | 'notification';
  challengeId?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  updatedAt: Date;
  updatedBy: string;
}
