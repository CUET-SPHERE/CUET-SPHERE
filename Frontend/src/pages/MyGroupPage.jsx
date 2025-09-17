import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Megaphone, Users, Plus, Edit, Trash2, Paperclip } from 'lucide-react';
import ApiService from '../services/api';
import webSocketService from '../services/websocket';
import ProfileImage from '../components/ProfileImage';

// Utility functions
const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

const getNoticeTypeStyle = (type) => {
  switch (type) {
    case 'URGENT':
      return {
        bg: 'bg-red-100 dark:bg-red-900/20',
        text: 'text-red-800 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800'
      };
    case 'ACADEMIC':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        text: 'text-blue-800 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800'
      };
    case 'EVENT':
      return {
        bg: 'bg-green-100 dark:bg-green-900/20',
        text: 'text-green-800 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800'
      };
    default: // GENERAL
      return {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-600'
      };
  }
};

const getNoticeTypeIcon = (type) => {
  switch (type) {
    case 'URGENT':
      return '🚨';
    case 'ACADEMIC':
      return '📚';
    case 'EVENT':
      return '📅';
    default: // GENERAL
      return '📢';
  }
};

function MyGroupPage() {
  const { user, isAuthenticated } = useUser();
  const [notices, setNotices] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', message: '', noticeType: 'GENERAL' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Filter state
  const [selectedNoticeType, setSelectedNoticeType] = useState('ALL');
  const [filteredNotices, setFilteredNotices] = useState([]);

  // Filter notices when notices or selectedNoticeType changes
  useEffect(() => {
    if (selectedNoticeType === 'ALL') {
      setFilteredNotices(notices);
    } else {
      const filtered = notices.filter(notice => notice.noticeType === selectedNoticeType);
      setFilteredNotices(filtered);
    }
  }, [notices, selectedNoticeType]);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, loading group data and setting up WebSocket');
      // Load data first, then setup WebSocket
      loadGroupData().then(() => {
        setupWebSocket();
      }).catch(err => {
        console.error('Failed to load initial data:', err);
        // Still try to setup WebSocket even if initial data fails
        setupWebSocket();
      });
    }

    // Cleanup WebSocket on unmount
    return () => {
      console.log('Cleaning up WebSocket subscriptions');
      if (user?.role === 'SYSTEM_ADMIN') {
        webSocketService.unsubscribe('notices_all');
      } else {
        webSocketService.unsubscribe(`notices_${user?.batch}_${user?.department}`);
      }
    };
  }, [isAuthenticated, user]);

  const setupWebSocket = async () => {
    try {
      console.log('Setting up WebSocket...');
      await webSocketService.connect();
      setWsConnected(true);
      console.log('WebSocket connected successfully');
      
      // Wait a bit for connection to be fully established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (user?.role === 'SYSTEM_ADMIN') {
        // Admin can see all notices
        console.log('Setting up admin WebSocket subscription');
        webSocketService.subscribeToAllNotices((notice) => {
          console.log('Received notice via WebSocket (admin):', notice);
          setNotices(prevNotices => {
            // Check if notice already exists
            const exists = prevNotices.find(n => n.noticeId === notice.noticeId);
            if (!exists) {
              return [notice, ...prevNotices];
            }
            return prevNotices;
          });
        });
      } else {
        // Regular users see only notices from their batch and department
        console.log('Setting up user WebSocket subscription for batch:', user.batch, 'department:', user.department);
        webSocketService.subscribeToNotices(user.batch, user.department, (notice) => {
          console.log('Received notice via WebSocket (user):', notice);
          setNotices(prevNotices => {
            // Check if notice already exists
            const exists = prevNotices.find(n => n.noticeId === notice.noticeId);
            if (!exists) {
              return [notice, ...prevNotices];
            }
            return prevNotices;
          });
        });
      }
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
      setWsConnected(false);
      // Fallback to polling if WebSocket fails
      const interval = setInterval(() => {
        console.log('WebSocket failed, using polling fallback');
        loadGroupData();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  };

  const loadGroupData = async (page = 0, append = false) => {
    try {
      if (page === 0) {
        setLoading(true);
        setCurrentPage(0);
      } else {
        setLoadingMore(true);
      }
      
      const [noticesData, membersData] = await Promise.all([
        ApiService.getAllNotices(page, pageSize),
        ApiService.getGroupMembers()
      ]);
      
      console.log('Notices data received:', noticesData);
      console.log('Members data received:', membersData);
      
      // Handle pagination response
      let noticesToSet = [];
      if (noticesData && noticesData.content) {
        // Backend pagination response
        noticesToSet = noticesData.content;
        setHasMore(noticesData.hasNext || false);
      } else if (Array.isArray(noticesData)) {
        // Fallback for non-paginated response
        noticesToSet = noticesData;
        setHasMore(false);
      }
      
      if (append) {
        setNotices(prevNotices => [...prevNotices, ...noticesToSet]);
      } else {
        setNotices(noticesToSet);
      }
      
      setGroupMembers(membersData || []);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading group data:', err);
      // Set empty arrays on error to prevent UI issues
      if (!append) {
        setNotices([]);
        setGroupMembers([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreNotices = async () => {
    if (hasMore && !loadingMore) {
      await loadGroupData(currentPage + 1, true);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    setShowScrollTop(scrollTop > 100);
  };

  const scrollToTop = () => {
    const container = document.querySelector('.notices-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closeNoticeModal = () => {
    setIsNoticeModalOpen(false);
    setNewNotice({ title: '', message: '', noticeType: 'GENERAL' });
    setIsSubmitting(false);
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.message.trim()) return;

    try {
      setIsSubmitting(true);
      console.log('Submitting notice:', newNotice);
      console.log('Notice data being sent:', JSON.stringify(newNotice, null, 2));
      
      const response = await ApiService.createNotice(newNotice);
      console.log('Notice creation response:', response);
      
      if (response && response.success) {
        // Reset form and close modal immediately
        setNewNotice({ title: '', message: '', noticeType: 'GENERAL' });
        setIsNoticeModalOpen(false);
        
        // Add the new notice to local state immediately for real-time feel
        if (response.noticeId) {
          const newNoticeWithId = {
            ...newNotice,
            noticeId: response.noticeId,
            senderName: user.fullName,
            senderEmail: user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            department: user.department,
            batch: user.batch
          };
          setNotices(prevNotices => [newNoticeWithId, ...prevNotices]);
        }
        
        // Reload data to ensure consistency
        await loadGroupData();
      } else {
        console.error('Notice creation failed:', response);
        let errorMessage = 'Unknown error occurred';
        
        if (response) {
          if (response.error) {
            errorMessage = response.error;
          } else if (response.message) {
            errorMessage = response.message;
          } else if (typeof response === 'string') {
            errorMessage = response;
          }
        }
        
        alert('Failed to create notice: ' + errorMessage);
      }
    } catch (err) {
      console.error('Error creating notice:', err);
      let errorMessage = 'Network error occurred';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response) {
        errorMessage = err.response.data?.error || err.response.data?.message || 'Server error';
      }
      
      alert('Failed to submit notice: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNoticeDelete = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      console.log('Deleting notice:', noticeId);
      const response = await ApiService.deleteNotice(noticeId);
      console.log('Delete response:', response);
      
      if (response && response.success) {
        // Remove notice from local state immediately for real-time feel
        setNotices(prevNotices => prevNotices.filter(n => n.noticeId !== noticeId));
        // Also reload data to ensure consistency
        await loadGroupData();
      } else {
        console.error('Notice deletion failed:', response);
        let errorMessage = 'Unknown error occurred';
        
        if (response) {
          if (response.error) {
            errorMessage = response.error;
          } else if (response.message) {
            errorMessage = response.message;
          } else if (typeof response === 'string') {
            errorMessage = response;
          }
        }
        
        alert('Failed to delete notice: ' + errorMessage);
      }
    } catch (err) {
      console.error('Error deleting notice:', err);
      let errorMessage = 'Network error occurred';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response) {
        errorMessage = err.response.data?.error || err.response.data?.message || 'Server error';
      }
      
      alert('Failed to delete notice: ' + errorMessage);
    }
  };

  const canCreateNotices = user?.role === 'CR' || user?.role === 'SYSTEM_ADMIN';
  const canDeleteNotice = (notice) => {
    return user?.role === 'SYSTEM_ADMIN' || 
           (user?.role === 'CR' && notice.senderEmail === user.email);
  };

  const getDepartmentName = (deptCode) => {
    const departments = {
      '01': 'Civil Engineering',
      '02': 'Mechanical Engineering', 
      '03': 'Electrical & Electronics Engineering',
      '04': 'Computer Science & Engineering',
      '05': 'Water Resources Engineering',
      '06': 'Petroleum & Mining Engineering',
      '07': 'Mechatronics and Industrial Engineering',
      '08': 'Electronics & Telecommunication Engineering',
      '09': 'Urban & Regional Planning',
      '10': 'Architecture',
      '11': 'Biomedical Engineering',
      '12': 'Nuclear Engineering',
      '13': 'Materials Science & Engineering',
      '14': 'Physics',
      '15': 'Chemistry',
      '16': 'Mathematics',
      '17': 'Humanities'
    };
    return departments[deptCode] || 'Unknown Department';
  };

  if (!isAuthenticated) return <Navigate to="/" />;

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 pb-24">{/* Updated pb-24 for floating bar space */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getDepartmentName(user?.department)} - Batch {user?.batch}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {groupMembers.length} members
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                wsConnected 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  wsConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {wsConnected ? 'Live Updates' : 'Polling Mode'}
              </div>
              <Megaphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Stacked Stats and Members */}
          <div className="lg:col-span-1 space-y-6">
            {/* Group Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Group Stats
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Members:</span>
                  <span className="font-semibold">{groupMembers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Notices:</span>
                  <span className="font-semibold">{notices.length}</span>
                </div>
              </div>
            </div>

            {/* Group Members */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Group Members
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {groupMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <ProfileImage 
                      userEmail={member.email}
                      userName={member.fullName}
                      size="sm"
                      showOnlineStatus={true}
                      isOnline={member.isOnline}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {member.fullName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {member.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Notices Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Group Notices
                </h3>
                {canCreateNotices && (
                  <button
                    onClick={() => setIsNoticeModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 inline mr-2" />
                    New Notice
                  </button>
                )}
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 notices-container" onScroll={handleScroll}>
                {filteredNotices.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {selectedNoticeType === 'ALL' ? 'No notices yet' : `No ${selectedNoticeType.toLowerCase()} notices`}
                  </p>
                ) : (
                  <>
                    {filteredNotices.map((notice) => {
                      const typeStyle = getNoticeTypeStyle(notice.noticeType);
                      const typeIcon = getNoticeTypeIcon(notice.noticeType);
                      
                      return (
                        <div key={notice.noticeId} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6 shadow-sm hover:shadow-md transition-shadow">
                          {/* Header with sender info and actions */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              {/* Sender Avatar */}
                              <ProfileImage 
                                userEmail={notice.senderEmail}
                                userName={notice.senderName}
                                size="lg"
                                className="flex-shrink-0"
                              />
                              
                              {/* Sender info and notice type */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                                    {notice.senderName}
                                  </h4>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                                    {typeIcon} {notice.noticeType}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatTimestamp(notice.createdAt || notice.updatedAt)}
                                </p>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            {canDeleteNotice(notice) && (
                              <button
                                onClick={() => handleNoticeDelete(notice.noticeId)}
                                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2"
                                title="Delete notice"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                          
                          {/* Notice content */}
                          <div className="pl-16">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-xl">
                              {notice.title}
                            </h3>
                            <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                              {notice.message.split('\n').map((line, index) => (
                                <p key={index} className={index > 0 ? 'mt-3' : ''}>
                                  {line}
                                </p>
                              ))}
                            </div>
                            
                            {/* Attachment */}
                            {notice.attachment && (
                              <div className="mt-4 flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-600 rounded-lg">
                                <Paperclip className="h-5 w-5 text-gray-500" />
                                <a 
                                  href={notice.attachment} 
                                  className="text-blue-600 dark:text-blue-400 hover:underline text-base font-medium"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View Attachment
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Load More Button */}
                    {hasMore && (
                      <div className="text-center pt-4">
                        <button
                          onClick={loadMoreNotices}
                          disabled={loadingMore}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingMore ? 'Loading...' : 'Load More Notices'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-xl hover:bg-blue-700 transition-all duration-200 hover:scale-110 z-40"
          title="Scroll to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Floating Filter Bar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 px-2 py-2 backdrop-blur-xl">
          <div className="flex space-x-1">
            {[
              { key: 'ALL', label: 'All', icon: '📋' },
              { key: 'GENERAL', label: 'General', icon: '📢' },
              { key: 'ACADEMIC', label: 'Academic', icon: '📚' },
              { key: 'URGENT', label: 'Urgent', icon: '🚨' },
              { key: 'EVENT', label: 'Events', icon: '📅' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedNoticeType(filter.key)}
                className={`relative flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-300 min-w-[70px] group ${
                  selectedNoticeType === filter.key
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:scale-102'
                }`}
              >
                <span className="text-lg mb-1 transition-transform group-hover:scale-110">{filter.icon}</span>
                <span className="text-xs font-medium leading-tight">{filter.label}</span>
                
                {/* Count Badge */}
                <div className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  selectedNoticeType === filter.key
                    ? 'bg-white text-blue-500 shadow-md'
                    : 'bg-blue-500 text-white'
                }`}>
                  {filter.key === 'ALL' ? notices.length : notices.filter(n => n.noticeType === filter.key).length}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notice Modal */}
      {isNoticeModalOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeNoticeModal}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Post New Notice
              </h3>
              <button
                onClick={closeNoticeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleNoticeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  value={newNotice.message}
                  onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newNotice.noticeType}
                  onChange={(e) => setNewNotice({ ...newNotice, noticeType: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="GENERAL">General</option>
                  <option value="ACADEMIC">Academic</option>
                  <option value="URGENT">Urgent</option>
                  <option value="EVENT">Event</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeNoticeModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyGroupPage;
