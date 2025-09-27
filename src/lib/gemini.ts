import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export interface GeminiResponse {
  text: string;
  success: boolean;
  error?: string;
}

export class GeminiService {
  private model: any;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateResponse(userMessage: string, context?: string): Promise<GeminiResponse> {
    try {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        return {
          text: "I'm sorry, but the AI service is not configured. Please contact support.",
          success: false,
          error: 'API key not configured'
        };
      }

      const prompt = `
You are a helpful assistant for a role-based challenge platform. Users can create and join challenges, and there are different user roles (admin, moderator, user).

Context: ${context || 'General platform assistance'}

User message: ${userMessage}

Please provide a helpful, concise response. If the user is asking about:
- Creating challenges: Explain how to create public or private challenges
- Joining challenges: Explain how to browse and join challenges
- User roles: Explain the different roles and permissions
- Platform features: Provide helpful information about available features
- General help: Offer assistance with common tasks

Keep responses friendly, informative, and under 200 words. If you're unsure about something specific to the platform, suggest contacting support.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        text: text.trim(),
        success: true
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact support.",
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async generateChallengeNotification(challengeTitle: string, action: 'joined' | 'left' | 'created' | 'completed'): Promise<string> {
    try {
      const prompt = `
Generate a friendly notification message for a user who has ${action} the challenge "${challengeTitle}".
Keep it concise, encouraging, and under 50 words.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text.trim();
    } catch (error) {
      console.error('Error generating notification:', error);
      return `You have ${action} the challenge "${challengeTitle}"!`;
    }
  }
}

export const geminiService = new GeminiService();
