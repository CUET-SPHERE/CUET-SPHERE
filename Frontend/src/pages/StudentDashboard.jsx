import React, { useState } from 'react';
import { Plus, Calendar, Bell, FileText, Users, Filter, Search, Pin } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import InfoCard from '../components/InfoCard';
import ResourceTab from '../components/ResourceTab';
import PostCard from '../components/PostCard';

const StudentDashboard = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('1st');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data
  const quickStats = [
    { title: 'Upcoming Exams', value: '3', icon: Calendar, color: 'red' },
    { title: 'New Notices', value: '5', icon: Bell, color: 'blue' },
    { title: 'Pending Tasks', value: '2', icon: FileText, color: 'orange' },
    { title: 'Study Groups', value: '4', icon: Users, color: 'green' }
  ];

  const semesterData = {
    '1st': {
      semester: '1st Semester',
      subjects: [
        {
          name: 'Mathematics I',
          resources: [
            { name: 'Calculus Notes', type: 'PDF', size: '2.5 MB' },
            { name: 'Assignment 1', type: 'DOC', size: '1.2 MB' },
            { name: 'Previous Year Questions', type: 'PDF', size: '3.1 MB' }
          ]
        },
        {
          name: 'Physics I',
          resources: [
            { name: 'Mechanics Notes', type: 'PDF', size: '4.2 MB' },
            { name: 'Lab Manual', type: 'PDF', size: '1.8 MB' }
          ]
        }
      ]
    },
    '2nd': {
      semester: '2nd Semester',
      subjects: [
        {
          name: 'Mathematics II',
          resources: [
            { name: 'Linear Algebra', type: 'PDF', size: '3.2 MB' },
            { name: 'Differential Equations', type: 'PDF', size: '2.8 MB' }
          ]
        }
      ]
    }
  };

  const posts = [
    {
      id: 1,
      title: 'Need help with Data Structures assignment',
      content: 'I\'m struggling with implementing binary trees. Can anyone help me understand the concept better?',
      author: 'Alice Johnson',
      timestamp: '2 hours ago',
      likes: 12,
      comments: 5,
      category: 'help'
    },
    {
      id: 2,
      title: 'Study group for Database Systems',
      content: 'Looking for serious students to form a study group for the upcoming database exam.',
      author: 'Bob Smith',
      timestamp: '4 hours ago',
      likes: 8,
      comments: 3,
      category: 'question'
    },
    {
      id: 3,
      title: 'Shared notes for Computer Networks',
      content: 'I\'ve compiled comprehensive notes for the CN course. Available for download.',
      author: 'Carol Davis',
      timestamp: '1 day ago',
      likes: 25,
      comments: 8,
      category: 'resource'
    }
  ];

  const notices = [
    {
      id: 1,
      title: 'Mid-term Exam Schedule Released',
      content: 'The mid-term examination schedule has been published. Please check your respective department notice boards.',
      category: 'exam',
      isPinned: true,
      timestamp: '1 hour ago'
    },
    {
      id: 2,
      title: 'Library Hours Extended',
      content: 'Central library will remain open until 10 PM during exam weeks.',
      category: 'general',
      isPinned: false,
      timestamp: '3 hours ago'
    },
    {
      id: 3,
      title: 'Workshop on Machine Learning',
      content: 'Registration open for the upcoming ML workshop. Limited seats available.',
      category: 'event',
      isPinned: true,
      timestamp: '1 day ago'
    }
  ];

  const filteredPosts = filterCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === filterCategory);

  const CreatePostModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create New Post
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Post title"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <textarea
            placeholder="What's on your mind?"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows="4"
          />
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="help">Need Help</option>
            <option value="question">Question</option>
            <option value="resource">Share Resource</option>
            <option value="announcement">Announcement</option>
          </select>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreatePost(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowCreatePost(false)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.fullName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.department} • Batch {user?.batch}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Student ID</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{user?.studentId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Info Panel */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <InfoCard key={index} {...stat} />
            ))}
          </div>
        </div>

        {/* Academic Resource Hub */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Academic Resources
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {Object.keys(semesterData).map((semester) => (
                  <button
                    key={semester}
                    onClick={() => setActiveTab(semester)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === semester
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {semester} Semester
                  </button>
                ))}
              </nav>
            </div>
            <div className="p-6">
              <ResourceTab {...semesterData[activeTab]} />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Peer Help Posts */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Peer Help Posts
              </h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="help">Help</option>
                  <option value="question">Questions</option>
                  <option value="resource">Resources</option>
                  <option value="announcement">Announcements</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          {/* Notice Board & Notifications */}
          <div className="space-y-8">
            {/* Notice Board */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Notice Board
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notices.map((notice) => (
                    <div key={notice.id} className="p-4">
                      <div className="flex items-start space-x-3">
                        {notice.isPinned && (
                          <Pin className="h-4 w-4 text-red-500 mt-1" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {notice.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notice.content}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {notice.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notification Center */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Notifications
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-900 dark:text-white">
                      New assignment posted in Data Structures
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900 dark:text-white">
                      Someone replied to your post
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-900 dark:text-white">
                      Exam schedule updated
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 z-40"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="flex justify-around py-2">
          <button className="flex flex-col items-center py-2 px-3 text-blue-600">
            <FileText className="h-5 w-5" />
            <span className="text-xs mt-1">Resources</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 text-gray-500">
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Community</span>
          </button>
          <button className="flex flex-col items-center py-2 px-3 text-gray-500">
            <Bell className="h-5 w-5" />
            <span className="text-xs mt-1">Notices</span>
          </button>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && <CreatePostModal />}
    </div>
  );
};

export default StudentDashboard;