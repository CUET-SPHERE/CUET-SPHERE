import React, { useState } from 'react';
import { Bell, Trash2, X, Newspaper, Shield } from 'lucide-react';
import { formatTimeAgo } from '../../utils/formatters';
import { Link } from 'react-router-dom';

function AdminNotificationsPage() {
   // Mock admin notifications specifically for new posts
   const [notifications, setNotifications] = useState([
      {
         id: 1,
         type: 'new_post',
         content: 'New post created by John Doe',
         postId: '123',
         postTitle: 'Questions about Data Structures',
         authorName: 'John Doe',
         timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
         read: false
      },
      {
         id: 2,
         type: 'new_post',
         content: 'New post created by Sarah Smith',
         postId: '124',
         postTitle: 'Need help with Algorithm assignment',
         authorName: 'Sarah Smith',
         timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
         read: false
      },
      {
         id: 3,
         type: 'new_post',
         content: 'New post created by Mike Johnson',
         postId: '125',
         postTitle: 'Lab report submission date',
         authorName: 'Mike Johnson',
         timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
         read: true
      }
   ]);

   const unreadCount = notifications.filter(n => !n.read).length;

   const handleClearAll = () => {
      if (notifications.length === 0) return;
      if (window.confirm('Are you sure you want to clear all notifications?')) {
         setNotifications([]);
      }
   };

   const handleDeleteNotification = (id) => {
      setNotifications(notifications.filter(n => n.id !== id));
   };

   const handleMarkAllAsRead = () => {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
   };

   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
         <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Shield className="h-8 w-8 text-red-500" />
                     <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Admin Notifications
                        {unreadCount > 0 && (
                           <span className="ml-3 px-2 py-1 bg-red-500 text-white text-sm rounded-full">
                              {unreadCount} new
                           </span>
                        )}
                     </h1>
                  </div>
                  <div className="flex items-center gap-4">
                     {notifications.length > 0 && (
                        <>
                           <button
                              onClick={handleMarkAllAsRead}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                           >
                              Mark all as read
                           </button>
                           <button
                              onClick={handleClearAll}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                           >
                              <Trash2 className="h-4 w-4" />
                              Clear all
                           </button>
                        </>
                     )}
                  </div>
               </div>
               <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Monitor new posts for content moderation
               </p>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
               {notifications.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                     <Bell className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                     <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
                     <p className="text-gray-500 dark:text-gray-400">All caught up with content moderation!</p>
                  </div>
               ) : (
                  notifications.map((notification) => (
                     <div
                        key={notification.id}
                        className={`relative group p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all ${!notification.read ? 'border-l-4 border-red-500' : ''
                           }`}
                     >
                        <div className="flex items-start gap-4">
                           <div className={`p-2 rounded-lg ${!notification.read
                              ? 'bg-red-50 dark:bg-red-500/10 text-red-500'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                              }`}>
                              <Newspaper className="h-5 w-5" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white">
                                 {notification.content}
                              </p>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                 Post: {notification.postTitle}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                 by {notification.authorName} • {formatTimeAgo(new Date(notification.timestamp))}
                              </p>
                           </div>
                           <div className="flex items-center gap-2">
                              <Link
                                 to={`/admin/feed`}
                                 className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              >
                                 Review
                              </Link>
                              <button
                                 onClick={() => handleDeleteNotification(notification.id)}
                                 className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-500 rounded-lg transition-colors"
                                 title="Delete notification"
                              >
                                 <X className="h-4 w-4" />
                              </button>
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
   );
}

export default AdminNotificationsPage;
