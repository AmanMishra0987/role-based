'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  where,
  updateDoc,
  doc,
  arrayUnion,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Challenge, ChallengeParticipant } from '@/types';
import { 
  Plus, 
  Calendar, 
  Users, 
  Trophy, 
  Lock, 
  Globe,
  Clock,
  Star,
  Target
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function Challenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'joined' | 'created'>('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'public' as 'public' | 'private',
    startDate: '',
    endDate: '',
    maxParticipants: '',
  });

  useEffect(() => {
    if (!user) return;

    const challengesQuery = query(
      collection(db, 'challenges'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(challengesQuery, (snapshot) => {
      const loadedChallenges: Challenge[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedChallenges.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          type: data.type,
          inviteCode: data.inviteCode,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          participants: data.participants || [],
          maxParticipants: data.maxParticipants,
          status: data.status,
        });
      });
      setChallenges(loadedChallenges);
    });

    return () => unsubscribe();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      const challengeData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        createdBy: user.uid,
        createdAt: new Date(),
        participants: [user.uid], // Creator automatically joins
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        status: 'active',
        inviteCode: formData.type === 'private' ? uuidv4().slice(0, 8).toUpperCase() : null,
      };

      await addDoc(collection(db, 'challenges'), challengeData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'public',
        startDate: '',
        endDate: '',
        maxParticipants: '',
      });
      setShowCreateForm(false);

      // Send notification to chatbot
      await addDoc(collection(db, 'chatMessages'), {
        userId: user.uid,
        message: `You successfully created the challenge: "${formData.title}"`,
        timestamp: new Date(),
        type: 'notification',
      });

    } catch (error) {
      console.error('Error creating challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string, challengeTitle: string) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'challenges', challengeId), {
        participants: arrayUnion(user.uid)
      });

      // Send notification to chatbot
      await addDoc(collection(db, 'chatMessages'), {
        userId: user.uid,
        message: `You joined the challenge: "${challengeTitle}"`,
        timestamp: new Date(),
        type: 'notification',
      });

    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const getFilteredChallenges = () => {
    if (!user) return [];

    switch (activeTab) {
      case 'joined':
        return challenges.filter(challenge => 
          challenge.participants.includes(user.uid) && challenge.createdBy !== user.uid
        );
      case 'created':
        return challenges.filter(challenge => challenge.createdBy === user.uid);
      default:
        return challenges.filter(challenge => 
          challenge.type === 'public' || challenge.participants.includes(user.uid)
        );
    }
  };

  const getStatusBadge = (challenge: Challenge) => {
    const now = new Date();
    const isActive = now >= challenge.startDate && now <= challenge.endDate;
    const isUpcoming = now < challenge.startDate;
    const isCompleted = now > challenge.endDate;

    if (isCompleted) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Completed</span>;
    } else if (isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
    } else if (isUpcoming) {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Upcoming</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Challenges</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Challenge
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'all', label: 'All Challenges', icon: Globe },
            { id: 'joined', label: 'Joined', icon: Users },
            { id: 'created', label: 'Created by Me', icon: Star }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Create Challenge Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Challenge</h3>
              
              <form onSubmit={createChallenge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Participants (optional)
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min="1"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Challenge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredChallenges().map((challenge) => (
          <div key={challenge.id} className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {challenge.type === 'private' ? (
                    <Lock className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Globe className="h-4 w-4 text-green-500" />
                  )}
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {challenge.title}
                  </h3>
                </div>
                {getStatusBadge(challenge)}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {challenge.description}
              </p>

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {challenge.startDate.toLocaleDateString()} - {challenge.endDate.toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>
                    {challenge.participants.length} participant{challenge.participants.length !== 1 ? 's' : ''}
                    {challenge.maxParticipants && ` / ${challenge.maxParticipants}`}
                  </span>
                </div>

                {challenge.type === 'private' && challenge.inviteCode && challenge.createdBy === user?.uid && (
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                      Code: {challenge.inviteCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t">
                {challenge.participants.includes(user?.uid || '') ? (
                  <div className="flex items-center text-green-600 text-sm">
                    <Trophy className="h-4 w-4 mr-2" />
                    {challenge.createdBy === user?.uid ? 'Created by you' : 'Joined'}
                  </div>
                ) : (
                  <button
                    onClick={() => joinChallenge(challenge.id, challenge.title)}
                    disabled={challenge.maxParticipants ? challenge.participants.length >= challenge.maxParticipants : false}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Join Challenge
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {getFilteredChallenges().length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges found</h3>
          <p className="text-gray-500">
            {activeTab === 'all' && "No challenges available. Create the first one!"}
            {activeTab === 'joined' && "You haven't joined any challenges yet."}
            {activeTab === 'created' && "You haven't created any challenges yet."}
          </p>
        </div>
      )}
    </div>
  );
}
