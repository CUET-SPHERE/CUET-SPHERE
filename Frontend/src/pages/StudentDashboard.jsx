import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Star, LogOut, Sun, Moon, Plus, Hand } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import AcademicResources from '../components/AcademicResources';
// import PostFeed from '../components/PostFeed';

// Mock user data
const mockUser = {
  fullName: 'Muhammad Rony',
  studentId: '2204005',
  department: 'CSE',
  batch: '2022-2023'
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const { login, isAuthenticated, logout } = useUser();
  // Removed sidebarOpen and all sidebar logic

  // Temporary: Auto-login for testing purposes
  React.useEffect(() => {
    if (!isAuthenticated) {
      login({
        fullName: 'Muhammad Rony',
        studentId: '2204005',
        email: 'rony@student.cuet.ac.bd',
        department: 'Computer Science & Engineering',
        batch: '2022-2023',
        hall: 'Bangabandhu Sheikh Mujibur Rahman Hall'
      });
    }
  }, [isAuthenticated, login]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="p-4 lg:p-6 space-y-6">
        {/* User Info as Text - Gorgeous Display */}
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <span className="text-white font-bold text-xl">
                  {mockUser.fullName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{mockUser.fullName}</h1>
                <p className="text-blue-100">Student ID: {mockUser.studentId}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100">Department</p>
              <p className="text-xl font-semibold">{mockUser.department}</p>
              <p className="text-sm text-blue-200">Batch {mockUser.batch}</p>
            </div>
          </div>
        </div>

        {/* Top Section - 3 Equal Height Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DepartmentalGroupCard />
          <WeekScheduleCard />
          <NotificationsCard />
        </div>

        {/* Second Section - Browse Feed + Academic Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Browse Feed Card - Full Height with Glass Effect */}
          <div className="lg:col-span-1">
            <BrowseFeedCard />
          </div>
          {/* Academic Resources - Modern Interactive Version */}
          <div className="lg:col-span-3">
            <AcademicResources />
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Browse Feed Card with Glass Effect
const BrowseFeedCard = () => {
  const navigate = useNavigate();
  return (
    <div
      className="h-96 bg-gradient-to-br from-white/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
      onClick={() => navigate('/feed')}
      title="Go to Feed"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"></div>
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6">
        {/* Browse Icon */}
        <div className="mb-6">
          <Hand className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        </div>
        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-6">
          Browse Feed
        </h3>
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-8">
          <p>Create post</p>
          <p>Connect with others</p>
          <p>Help others to reach their goal</p>
        </div>
        {/* Create Button */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110">
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

// Same Height Cards
const DepartmentalGroupCard = () => {
  const activities = [
    { type: 'CT', title: 'Data Structures CT-2', date: 'Tomorrow' },
    { type: 'Result', title: 'Algorithm CT-1 Result', status: 'Published' },
    { type: 'Announcement', title: 'Lab Schedule Updated', time: '2 hours ago' },
    { type: 'CT', title: 'Database CT-1', date: 'Next Week' }
  ];

  return (
    <div className="h-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
        Departmental Group
      </h3>
      <div className="space-y-3">
        {activities.slice(0, 4).map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
              activity.type === 'CT' ? 'bg-red-500' :
              activity.type === 'Result' ? 'bg-green-500' : 'bg-blue-500'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {activity.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {activity.date || activity.status || activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WeekScheduleCard = () => {
  const schedule = [
    { day: 'Mon', course: 'Data Structures', time: '10:00 AM' },
    { day: 'Tue', course: 'Algorithm', time: '2:00 PM' },
    { day: 'Wed', course: 'Database', time: '11:00 AM' },
    { day: 'Thu', course: 'Software Eng.', time: '9:00 AM' },
    { day: 'Fri', course: 'Computer Networks', time: '1:00 PM' }
  ];

  return (
    <div className="h-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
        This Week Schedule
      </h3>
      <div className="space-y-3">
        {schedule.slice(0, 4).map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {item.course}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {item.day}
              </p>
            </div>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded flex-shrink-0">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotificationsCard = () => {
  const notifications = [
    { title: 'New assignment posted', subject: 'Data Structures', time: '2h ago', unread: true },
    { title: 'CT schedule updated', subject: 'Algorithm', time: '4h ago', unread: true },
    { title: 'Lab manual uploaded', subject: 'Database', time: '1d ago', unread: false },
    { title: 'Result published', subject: 'Software Eng.', time: '2d ago', unread: false }
  ];

  return (
    <div className="h-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
        Notifications
      </h3>
      <div className="space-y-3">
        {notifications.slice(0, 4).map((notification, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
              notification.unread ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {notification.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {notification.subject} • {notification.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;