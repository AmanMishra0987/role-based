'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  where,
  getDocs,
  limit,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChatMessage, FAQ } from '@/types';
import { Send, Bot, User as UserIcon, MessageCircle, X, Settings } from 'lucide-react';
import { geminiService } from '@/lib/gemini';

interface ChatbotProps {
  isWidget?: boolean;
  onClose?: () => void;
}

export default function Chatbot({ isWidget = false, onClose }: ChatbotProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Load chat messages - simplified query to avoid index requirement
    const messagesQuery = query(
      collection(db, 'chatMessages'),
      where('userId', '==', user.uid),
      limit(50)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const loadedMessages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          id: doc.id,
          userId: data.userId,
          message: data.message,
          timestamp: data.timestamp?.toDate() || new Date(),
          type: data.type,
          challengeId: data.challengeId,
        });
      });
      // Sort messages by timestamp on the client side
      loadedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setMessages(loadedMessages);
    });

    // Load FAQs
    const loadFAQs = async () => {
      try {
        const faqQuery = query(collection(db, 'faqs'), limit(100));
        const faqSnapshot = await getDocs(faqQuery);
        const loadedFAQs: FAQ[] = [];
        faqSnapshot.forEach((doc) => {
          const data = doc.data();
          loadedFAQs.push({
            id: doc.id,
            question: data.question,
            answer: data.answer,
            category: data.category,
            updatedAt: data.updatedAt?.toDate() || new Date(),
            updatedBy: data.updatedBy,
          });
        });
        // Sort FAQs by category and updatedAt
        loadedFAQs.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        });
        setFaqs(loadedFAQs);
      } catch (error) {
        console.error('Error loading FAQs:', error);
      }
    };

    loadFAQs();

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateBotResponse = async (userMessage: string): Promise<string> => {
    // First check FAQs for exact matches
    const lowerMessage = userMessage.toLowerCase();
    
    for (const faq of faqs) {
      const questionKeywords = faq.question.toLowerCase().split(' ');
      const hasKeywords = questionKeywords.some(keyword => 
        keyword.length > 3 && lowerMessage.includes(keyword)
      );
      
      if (hasKeywords) {
        return faq.answer;
      }
    }

    // Use Gemini AI for more intelligent responses
    const context = `User role: ${user?.role || 'user'}, Platform: Challenge-based role management system`;
    const geminiResponse = await geminiService.generateResponse(userMessage, context);
    
    if (geminiResponse.success) {
      return geminiResponse.text;
    }

    // Fallback responses
    if (lowerMessage.includes('challenge') || lowerMessage.includes('create')) {
      return "You can create a new challenge by clicking the 'Create Challenge' button in the Challenges section. You can make it public for anyone to join or private with an invite code.";
    }
    
    if (lowerMessage.includes('join') || lowerMessage.includes('participate')) {
      return "To join a challenge, you can browse public challenges or enter an invite code for private challenges. Once you join, you'll be able to track your progress on the challenge dashboard.";
    }
    
    if (lowerMessage.includes('role') || lowerMessage.includes('permission')) {
      return "Your current role determines what features you can access. Users can participate in challenges, Moderators can manage content, and Admins have full access to all features.";
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I'm here to help! You can ask me about creating challenges, joining challenges, managing your account, or any other questions about the platform.";
    }

    return "I'm not sure how to help with that specific question. Could you try rephrasing it or asking about challenges, roles, or platform features?";
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !user || loading) return;

    setLoading(true);
    const userMessage = inputMessage.trim();
    setInputMessage('');

    try {
      // Add user message
      await addDoc(collection(db, 'chatMessages'), {
        userId: user.uid,
        message: userMessage,
        timestamp: new Date(),
        type: 'user',
      });

      // Generate bot response using Gemini AI
      const botResponse = await generateBotResponse(userMessage);
      
      // Add bot response
      await addDoc(collection(db, 'chatMessages'), {
        userId: user.uid,
        message: botResponse,
        timestamp: new Date(),
        type: 'bot',
      });

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to send challenge notifications
  const sendChallengeNotification = async (challengeTitle: string, action: 'joined' | 'left' | 'created' | 'completed', challengeId?: string) => {
    if (!user) return;

    try {
      const notificationMessage = await geminiService.generateChallengeNotification(challengeTitle, action);
      
      await addDoc(collection(db, 'chatMessages'), {
        userId: user.uid,
        message: notificationMessage,
        timestamp: new Date(),
        type: 'notification',
        challengeId: challengeId,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Expose notification function for external use
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).sendChallengeNotification = sendChallengeNotification;
    }
  }, [user]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // If it's a floating widget, show the toggle button
  if (isWidget && !isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    );
  }

  const containerClasses = isWidget 
    ? "fixed bottom-4 right-4 z-50 flex flex-col h-96 w-80 bg-white rounded-lg shadow-lg border"
    : "flex flex-col h-full bg-white rounded-lg shadow";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-medium">Platform Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          {(user?.role === 'admin' || user?.role === 'moderator') && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:text-gray-200 p-1"
              title="FAQ Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          {isWidget && (
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Welcome! I'm here to help you with the platform.</p>
            <p className="text-sm mt-2">Ask me about challenges, roles, or how to get started!</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`flex-shrink-0 ${message.type === 'user' ? 'order-2' : ''}`}>
                {message.type === 'bot' ? (
                  <Bot className="h-6 w-6 text-indigo-600" />
                ) : (
                  <UserIcon className="h-6 w-6 text-gray-600" />
                )}
              </div>
              
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-indigo-600 text-white'
                    : message.type === 'notification'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-indigo-600" />
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* FAQ Management for Admin/Moderator */}
      {showSettings && (user?.role === 'admin' || user?.role === 'moderator') && (
        <div className="border-t p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">FAQ Management</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white p-2 rounded border text-xs">
                <div className="font-medium text-gray-700">{faq.question}</div>
                <div className="text-gray-600 mt-1">{faq.answer}</div>
                <div className="text-gray-400 mt-1">Category: {faq.category}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            FAQ responses are automatically matched to user questions. 
            Update FAQs in the admin panel for better responses.
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !inputMessage.trim()}
            className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
