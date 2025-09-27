'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Chatbot from '@/components/Chatbot';
import Challenges from '@/components/Challenges';
import FAQManagement from '@/components/admin/FAQManagement';
import { 
  Users, 
  Shield, 
  Crown, 
  LogOut, 
  MessageCircle, 
  Trophy,
  Plus,
  Settings
} from 'lucide-react';

interface DashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ activeTab, setActiveTab }: DashboardProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-5 w-5 text-blue-500" />;
      default:
        return <Users className="h-5 w-5 text-green-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (role) {
      case 'admin':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'moderator':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-green-100 text-green-800`;
    }
  };

  const menuItems = [
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'chatbot', label: 'Chatbot', icon: MessageCircle },
    ...(user?.role === 'admin' || user?.role === 'moderator' 
      ? [
          { id: 'admin', label: 'Admin Panel', icon: Settings },
          { id: 'faq', label: 'FAQ Management', icon: MessageCircle }
        ] 
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Role-Based Challenge Platform
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getRoleIcon(user?.role || 'user')}
                <span className="text-sm font-medium text-gray-700">
                  {user?.displayName || user?.email}
                </span>
                <span className={getRoleBadge(user?.role || 'user')}>
                  {(user?.role || 'user').charAt(0).toUpperCase() + (user?.role || 'user').slice(1)}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === item.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'challenges' && <Challenges />}

            {activeTab === 'chatbot' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Chatbot</h2>
                <div className="h-96">
                  <Chatbot />
                </div>
              </div>
            )}

            {activeTab === 'admin' && (user?.role === 'admin' || user?.role === 'moderator') && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                    <p className="text-gray-500">Manage user roles and permissions.</p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">FAQ Management</h3>
                    <p className="text-gray-500">Update chatbot responses and FAQs.</p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Challenge Oversight</h3>
                    <p className="text-gray-500">Monitor and manage all challenges.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (user?.role === 'admin' || user?.role === 'moderator') && (
              <FAQManagement />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
