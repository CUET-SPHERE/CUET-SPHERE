import React, { useState } from 'react';
import { Users, X } from 'lucide-react';
import PostFeed from '../components/PostFeed';
import UserSidebar from '../components/UserSidebar';
import UserProfile from '../components/UserProfile';

function FeedPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserProfile(true);
    setShowSidebar(false); // Close sidebar on mobile when user is selected
  };

  const handleCloseProfile = () => {
    setShowUserProfile(false);
    setSelectedUser(null);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex relative overflow-hidden">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
      >
        {showSidebar ? <X className="h-5 w-5" /> : <Users className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {showSidebar && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setShowSidebar(false)}
        />
      )}
      
      {/* User Sidebar - Fixed height with its own scroll */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-10 lg:z-auto h-screen
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <UserSidebar 
          onUserClick={handleUserClick}
          selectedUserId={selectedUser?.id}
        />
      </div>
      
      {/* Main Content - Independent scrolling */}
      <div className="flex-1 lg:ml-0 h-screen overflow-y-auto">
        <PostFeed />
      </div>

      {/* User Profile Modal */}
      <UserProfile 
        user={selectedUser}
        isOpen={showUserProfile}
        onClose={handleCloseProfile}
      />
    </div>
  );
}

export default FeedPage;
