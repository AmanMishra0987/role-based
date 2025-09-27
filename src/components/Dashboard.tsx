'use client';

import React, { useState } from 'react';
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
  Settings
} from 'lucide-react';

interface DashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ activeTab, setActiveTab }: DashboardProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 ml-2 lg:ml-0">
                <span className="hidden sm:inline">Role-Based Challenge Platform</span>
                <span className="sm:hidden">Challenge Platform</span>
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                {getRoleIcon(user?.role || 'user')}
                <span className="text-sm font-medium text-gray-700 truncate max-w-32">
                  {user?.displayName || user?.email}
                </span>
                <span className={getRoleBadge(user?.role || 'user')}>
                  {(user?.role || 'user').charAt(0).toUpperCase() + (user?.role || 'user').slice(1)}
                </span>
              </div>
              
              {/* Mobile user info */}
              <div className="sm:hidden flex items-center space-x-1">
                {getRoleIcon(user?.role || 'user')}
                <span className={getRoleBadge(user?.role || 'user')}>
                  {(user?.role || 'user').charAt(0).toUpperCase() + (user?.role || 'user').slice(1)}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-2 sm:px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
          </div>
        )}

        {/* Sidebar */}
        <nav className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false); // Close mobile sidebar when item is selected
                    }}
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
        <main className="flex-1 p-4 sm:p-6 lg:ml-0">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'challenges' && <Challenges />}

            {activeTab === 'chatbot' && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Chatbot</h2>
                <div className="h-80 sm:h-96">
                  <Chatbot />
                </div>
              </div>
            )}

            {activeTab === 'admin' && (user?.role === 'admin' || user?.role === 'moderator') && (
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Admin Panel</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                    <p className="text-gray-500">Manage user roles and permissions.</p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">FAQ Management</h3>
                    <p className="text-gray-500">Update chatbot responses and FAQs.</p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4 sm:p-6">
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
