'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FAQ } from '@/types';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

export default function FAQManagement() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general'
  });

  useEffect(() => {
    loadFAQs();
  }, []);

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
      
      // Sort FAQs by category and updatedAt on client side
      loadedFAQs.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
      
      setFaqs(loadedFAQs);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.question.trim() || !formData.answer.trim()) return;

    try {
      await addDoc(collection(db, 'faqs'), {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category,
        updatedAt: new Date(),
        updatedBy: user.uid,
      });

      setFormData({ question: '', answer: '', category: 'general' });
      setShowAddForm(false);
      loadFAQs();
    } catch (error) {
      console.error('Error adding FAQ:', error);
    }
  };

  const handleUpdateFAQ = async (id: string, updatedData: Partial<FAQ>) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'faqs', id), {
        ...updatedData,
        updatedAt: new Date(),
        updatedBy: user.uid,
      });

      setEditingId(null);
      loadFAQs();
    } catch (error) {
      console.error('Error updating FAQ:', error);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await deleteDoc(doc(db, 'faqs', id));
      loadFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const startEditing = (faq: FAQ) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ question: '', answer: '', category: 'general' });
  };

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>You don't have permission to manage FAQs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading FAQs...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">FAQ Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add FAQ</span>
        </button>
      </div>

      {/* Add FAQ Form */}
      {showAddForm && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Add New FAQ</h3>
          <form onSubmit={handleAddFAQ} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter the question..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Enter the answer..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="general">General</option>
                <option value="challenges">Challenges</option>
                <option value="account">Account</option>
                <option value="roles">Roles & Permissions</option>
                <option value="technical">Technical Support</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save FAQ</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No FAQs found. Add your first FAQ to get started.</p>
          </div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="bg-white border rounded-lg p-6">
              {editingId === faq.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Answer
                    </label>
                    <textarea
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="general">General</option>
                      <option value="challenges">Challenges</option>
                      <option value="account">Account</option>
                      <option value="roles">Roles & Permissions</option>
                      <option value="technical">Technical Support</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleUpdateFAQ(faq.id, formData)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 mb-2">{faq.answer}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {faq.category}
                        </span>
                        <span>
                          Updated: {faq.updatedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => startEditing(faq)}
                        className="text-indigo-600 hover:text-indigo-800 p-1"
                        title="Edit FAQ"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFAQ(faq.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete FAQ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
