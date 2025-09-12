import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Megaphone, Users, Plus, Edit, Trash2, Paperclip, Calendar } from 'lucide-react';
import ApiService from '../services/api';
import webSocketService from '../services/websocket';

function MyGroupPage() {
  const { user, isAuthenticated } = useUser();
  const [notices, setNotices] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', message: '', noticeType: 'GENERAL' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const noticesContainerRef = useRef(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Helper function to group notices by date
  const groupNoticesByDate = (notices) => {
    const groups = {};
    
    notices.forEach(notice => {
      const date = new Date(notice.createdAt);
      const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      
      groups[dateStr].push(notice);
    });
    
    // Sort notices within each group by createdAt (oldest first so newest are at bottom)
    Object.keys(groups).forEach(dateStr => {
      groups[dateStr].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });
    
    // Convert to array of {date, notices} objects
    return Object.keys(groups).map(date => ({
      date,
      notices: groups[date]
    })).sort((a, b) => {
      // Sort by date (oldest first) to make it like WhatsApp with newest dates at the bottom
      return new Date(a.date) - new Date(b.date);
    });
  };

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
      console.log('Setting up WebSocket connection...');
      await webSocketService.connect();
      setWsConnected(true);
      console.log('%cWebSocket connected successfully', 'color: green; font-weight: bold');
      
      // Wait a bit for connection to be fully established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (user?.role === 'SYSTEM_ADMIN') {
        // Admin can see all notices
        console.log('Setting up admin WebSocket subscription for all notices');
        webSocketService.subscribeToAllNotices((notice) => {
          console.log('%cReceived notice via WebSocket (admin):', 'color: blue; font-weight: bold', notice);
          
          // Ensure notice has a valid createdAt date
          if (!notice.createdAt) {
            notice.createdAt = new Date().toISOString();
          }
          
          // Add to state with animation flag for UI feedback
          setNotices(prevNotices => {
            // Check if notice already exists
            const exists = prevNotices.find(n => n.noticeId === notice.noticeId);
            if (!exists) {
              // Add isNew flag for animation
              return [{ ...notice, isNew: true }, ...prevNotices];
            }
            return prevNotices;
          });
          
          // Scroll to top to show new notice
          if (noticesContainerRef.current) {
            noticesContainerRef.current.scrollTop = 0;
          }
        });
      } else {
        // Regular users see only notices from their batch and department
        console.log('Setting up user WebSocket subscription for batch:', user.batch, 'department:', user.department);
        webSocketService.subscribeToNotices(user.batch, user.department, (notice) => {
          console.log('%cReceived notice via WebSocket (user):', 'color: blue; font-weight: bold', notice);
          
          // Ensure notice has a valid createdAt date
          if (!notice.createdAt) {
            notice.createdAt = new Date().toISOString();
          }
          
          // Add to state with animation flag for UI feedback
          setNotices(prevNotices => {
            // Check if notice already exists
            const exists = prevNotices.find(n => n.noticeId === notice.noticeId);
            if (!exists) {
              // Add isNew flag for animation
              return [{ ...notice, isNew: true }, ...prevNotices];
            }
            return prevNotices;
          });
          
          // Scroll to top to show new notice
          if (noticesContainerRef.current) {
            noticesContainerRef.current.scrollTop = 0;
          }
        });
      }
      
      // Log WebSocket status periodically for testing
      const wsStatusInterval = setInterval(() => {
        const isConnected = webSocketService.isConnected();
        console.log(`%cWebSocket status: ${isConnected ? 'Connected' : 'Disconnected'}`, 
          `color: ${isConnected ? 'green' : 'red'}; font-weight: bold`);
        setWsConnected(isConnected);
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(wsStatusInterval);
    } catch (error) {
      console.error('%cFailed to setup WebSocket:', 'color: red; font-weight: bold', error);
      setWsConnected(false);
      // Fallback to polling if WebSocket fails
      const interval = setInterval(() => {
        console.log('%cWebSocket failed, using polling fallback', 'color: orange');
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
      
      // Ensure all notices have valid createdAt dates for grouping
      noticesToSet = noticesToSet.map(notice => {
        if (!notice.createdAt) {
          // If no createdAt, use current date as fallback
          return { ...notice, createdAt: new Date().toISOString() };
        }
        return notice;
      });
      
      if (append) {
        setNotices(prevNotices => {
          // Combine and deduplicate notices by ID
          const existingIds = new Set(prevNotices.map(n => n.noticeId));
          const newNotices = noticesToSet.filter(n => !existingIds.has(n.noticeId));
          return [...prevNotices, ...newNotices];
        });
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
      console.log('Loading more notices, page:', currentPage + 1);
      await loadGroupData(currentPage + 1, true);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollTop(scrollTop > 100);
    
    // Check if user has scrolled to the bottom (with a small threshold)
    const scrollThreshold = 50;
    if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
      // User is near the bottom, load more if available
      if (hasMore && !loadingMore) {
        loadMoreNotices();
      }
    }
  };

  const scrollToTop = () => {
    if (noticesContainerRef.current) {
      noticesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                {getDepartmentName(user?.department)} - Batch {user?.batch}
                {/* WebSocket Connection Indicator */}
                <div className="ml-3 flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-1 ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {wsConnected ? 'Live' : 'Offline'}
                  </span>
                </div>
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
              
              {/* Test API Button */}
              <button
                onClick={async () => {
                  try {
                    console.log('Testing API endpoints...');
                    
                    // Test debug endpoint
                    const debugResponse = await fetch('/api/notices/debug');
                    const debugData = await debugResponse.json();
                    console.log('Debug endpoint response:', debugData);
                    
                    // Test database endpoint
                    const dbResponse = await fetch('/api/notices/db-check');
                    const dbData = await dbResponse.json();
                    console.log('Database check response:', dbData);
                    
                    alert('API test completed. Check console for details.');
                  } catch (err) {
                    console.error('API test failed:', err);
                    alert('API test failed: ' + err.message);
                  }
                }}
                className="px-3 py-1 bg-yellow-500 text-white text-xs rounded-lg hover:bg-yellow-600"
                title="Test API endpoints"
              >
                Test API
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Center - Notices - Now Wider */}
          <div className="lg:col-span-3">
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
              
              <div 
                ref={noticesContainerRef}
                className="max-h-[600px] overflow-y-auto pr-2 notices-container bg-gray-100 dark:bg-gray-800 rounded-lg" 
                onScroll={handleScroll}
              >
                {notices.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No notices yet</p>
                ) : (
                  <div className="p-4 space-y-6">
                    {groupNoticesByDate(notices).map((group, groupIndex) => (
                      <div key={group.date} className="space-y-3">
                        {/* Date header - sticky */}
                        <div className="sticky top-0 z-10 flex justify-center mb-2">
                          <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center shadow-sm">
                            <Calendar size={12} className="mr-1 text-gray-600 dark:text-gray-300" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{group.date}</span>
                          </div>
                        </div>
                        
                        {/* Notices for this date */}
                        {group.notices.map((notice) => {
                          const isCurrentUserSender = notice.senderEmail === user.email;
                          return (
                            <div key={notice.noticeId} className={`flex ${isCurrentUserSender ? 'justify-end' : 'justify-start'} ${notice.isNew ? 'animate-fade-in' : ''}`}>
                              <div className={`max-w-[80%] ${isCurrentUserSender ? 'bg-primary text-white' : 'bg-white dark:bg-gray-700'} rounded-lg p-3 shadow-sm relative ${notice.isNew ? 'animate-pulse' : ''}`}>
                                {/* Notice header with sender info and delete button */}
                                <div className="flex items-start justify-between mb-1">
                                  <div>
                                    <h4 className={`font-semibold ${isCurrentUserSender ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{notice.title}</h4>
                                    <p className={`text-xs ${isCurrentUserSender ? 'text-gray-100' : 'text-gray-500'}`}>by {notice.senderName}</p>
                                  </div>
                                  {canDeleteNotice(notice) && (
                                    <button
                                      onClick={() => handleNoticeDelete(notice.noticeId)}
                                      className={`${isCurrentUserSender ? 'text-white hover:text-gray-200' : 'text-red-600 hover:text-red-800'} ml-2`}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                                
                                {/* Notice message */}
                                <p className={`${isCurrentUserSender ? 'text-white' : 'text-gray-700 dark:text-gray-300'} text-sm whitespace-pre-wrap break-words`}>
                                  {notice.message}
                                </p>
                                
                                {/* Attachment if any */}
                                {notice.attachment && (
                                  <div className="mt-2 flex items-center">
                                    <Paperclip className="h-3 w-3 inline mr-1" />
                                    <a href={notice.attachment} className={`${isCurrentUserSender ? 'text-white underline' : 'text-blue-600 hover:underline'} text-xs`}>
                                      Attachment
                                    </a>
                                  </div>
                                )}
                                
                                {/* Timestamp */}
                                <div className={`text-right mt-1 text-xs ${isCurrentUserSender ? 'text-gray-100' : 'text-gray-500'}`}>
                                  {new Date(notice.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                                
                                {/* WebSocket Indicator for new messages */}
                                {notice.isNew && (
                                  <div className="absolute -top-2 -left-2 bg-green-500 text-white rounded-full p-1 shadow-md animate-ping-slow">
                                    <div className="w-2 h-2"></div>
                                  </div>
                                )}
                                
                                {/* Chat bubble tail */}
                                <div className={`absolute ${isCurrentUserSender ? 'right-0 -mr-2' : 'left-0 -ml-2'} top-2 w-2 h-2 transform ${isCurrentUserSender ? 'rotate-45 bg-primary' : 'rotate-45 bg-white dark:bg-gray-700'}`}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    
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
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
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
              <div className="space-y-3">
                {groupMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-semibold">
                      {member.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
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
        </div>
      </div>

      {/* Notice Modal - WhatsApp Style */}
      {isNoticeModalOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeNoticeModal}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - WhatsApp Style */}
            <div className="flex items-center bg-primary p-4">
              <button
                onClick={closeNoticeModal}
                className="text-white mr-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold text-white flex-1">
                New Group Notice
              </h3>
            </div>
            
            <form onSubmit={handleNoticeSubmit} className="p-4">
              {/* Notice Type Selector - Pills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'GENERAL', label: 'General', color: 'bg-gray-200 text-gray-800' },
                    { value: 'ACADEMIC', label: 'Academic', color: 'bg-blue-100 text-blue-800' },
                    { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-800' },
                    { value: 'EVENT', label: 'Event', color: 'bg-green-100 text-green-800' }
                  ].map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewNotice({ ...newNotice, noticeType: type.value })}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${type.color} ${newNotice.noticeType === type.value ? 'ring-2 ring-primary' : ''}`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Title Input */}
              <div className="mb-4">
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Notice Title *"
                  required
                />
              </div>
              
              {/* Message Input - WhatsApp Style */}
              <div className="mb-4 relative">
                <textarea
                  value={newNotice.message}
                  onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
                  rows={4}
                  className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Type your message here... *"
                  required
                />
                <div className="absolute right-3 bottom-3 flex space-x-2">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-primary"
                    title="Add attachment (not implemented)"
                  >
                    <Paperclip size={18} />
                  </button>
                </div>
              </div>
              
              {/* Submit Button - WhatsApp Style */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="p-3 bg-primary text-white rounded-full hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isSubmitting || !newNotice.title.trim() || !newNotice.message.trim()}
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default MyGroupPage;
