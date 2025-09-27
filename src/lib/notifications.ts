import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { geminiService } from '@/lib/gemini';

export interface ChallengeNotificationData {
  userId: string;
  challengeTitle: string;
  action: 'joined' | 'left' | 'created' | 'completed';
  challengeId?: string;
}

export const sendChallengeNotification = async (data: ChallengeNotificationData) => {
  try {
    const notificationMessage = await geminiService.generateChallengeNotification(
      data.challengeTitle, 
      data.action
    );
    
    await addDoc(collection(db, 'chatMessages'), {
      userId: data.userId,
      message: notificationMessage,
      timestamp: new Date(),
      type: 'notification',
      challengeId: data.challengeId,
    });

    console.log('Challenge notification sent:', data.action, data.challengeTitle);
  } catch (error) {
    console.error('Error sending challenge notification:', error);
  }
};

// Helper functions for common notification scenarios
export const notifyChallengeJoined = (userId: string, challengeTitle: string, challengeId: string) => {
  return sendChallengeNotification({
    userId,
    challengeTitle,
    action: 'joined',
    challengeId,
  });
};

export const notifyChallengeLeft = (userId: string, challengeTitle: string, challengeId: string) => {
  return sendChallengeNotification({
    userId,
    challengeTitle,
    action: 'left',
    challengeId,
  });
};

export const notifyChallengeCreated = (userId: string, challengeTitle: string, challengeId: string) => {
  return sendChallengeNotification({
    userId,
    challengeTitle,
    action: 'created',
    challengeId,
  });
};

export const notifyChallengeCompleted = (userId: string, challengeTitle: string, challengeId: string) => {
  return sendChallengeNotification({
    userId,
    challengeTitle,
    action: 'completed',
    challengeId,
  });
};
