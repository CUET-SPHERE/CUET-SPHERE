import React, { useState } from 'react';
import { Bell, Trash2, X, Newspaper, Shield } from 'lucide-react';
import { formatTimeAgo } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

function AdminNotificationsPage() {
   const { colors } = useTheme();

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
      <div className={`min-h-screen ${colors.background.main} pt-8`}>
         <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Shield className={`h-8 w-8 ${colors.status.urgent}`} />
                     <h1 className={`text-2xl font-bold ${colors.text.primary}`}>
                        Admin Notifications
                        {unreadCount > 0 && (
                           <span className={`ml-3 px-2 py-1 ${colors.status.urgent} text-white text-sm rounded-full`}>
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
                              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium ${colors.text.secondary} hover:${colors.text.primary} transition-colors`}
                           >
                              Mark all as read
                           </button>
                           <button
                              onClick={handleClearAll}
                              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium ${colors.status.urgent} hover:text-red-600 dark:hover:text-red-400 transition-colors`}
                           >
                              <Trash2 className="h-4 w-4" />
                              Clear all
                           </button>
                        </>
                     )}
                  </div>
               </div>
               <p className={`mt-2 ${colors.text.secondary}`}>
                  Monitor new posts for content moderation
               </p>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
               {notifications.length === 0 ? (
                  <div className={`text-center py-12 ${colors.background.surface} rounded-xl shadow-sm`}>
                     <Bell className={`h-12 w-12 ${colors.text.disabled} mx-auto mb-4`} />
                     <h3 className={`text-lg font-medium ${colors.text.primary} mb-2`}>No notifications</h3>
                     <p className={`${colors.text.secondary}`}>All caught up with content moderation!</p>
                  </div>
               ) : (
                  notifications.map((notification) => (
                     <div
                        key={notification.id}
                        className={`relative group p-4 ${colors.background.surface} rounded-xl shadow-sm transition-all ${!notification.read ? `border-l-4 ${colors.status.urgent}` : ''
                           }`}
                     >
                        <div className="flex items-start gap-4">
                           <div className={`p-2 rounded-lg ${!notification.read
                              ? `${colors.background.primary} ${colors.status.urgent}`
                              : `${colors.background.subtle} ${colors.text.disabled}`
                              }`}>
                              <Newspaper className="h-5 w-5" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className={`text-sm ${colors.text.primary}`}>
                                 {notification.content}
                              </p>
                              <p className={`mt-1 text-sm ${colors.text.secondary}`}>
                                 Post: {notification.postTitle}
                              </p>
                              <p className={`mt-1 text-xs ${colors.text.disabled}`}>
                                 by {notification.authorName} • {formatTimeAgo(new Date(notification.timestamp))}
                              </p>
                           </div>
                           <div className="flex items-center gap-2">
                              <Link
                                 to={`/admin/feed`}
                                 className={`px-3 py-1 text-sm ${colors.primary.base} hover:${colors.primary.hover} text-white rounded-lg transition-colors`}
                              >
                                 Review
                              </Link>
                              <button
                                 onClick={() => handleDeleteNotification(notification.id)}
                                 className={`p-1.5 ${colors.text.disabled} hover:${colors.status.urgent} rounded-lg transition-colors`}
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
