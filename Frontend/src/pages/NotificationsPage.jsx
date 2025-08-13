import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Trash2, Check, MessageSquare, Heart, Share2, Users, FileText, X } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters';
import { mockNotifications as initialNotifications } from '../mock/mockNotifications';

function NotificationIcon({ type }) {
   const icons = {
      post_like: Heart,
      comment: MessageSquare,
      mention: MessageSquare,
      resource_share: FileText,
      group_invite: Users
   };

   const Icon = icons[type] || Bell;

   return <Icon className="h-5 w-5" />;
}

function NotificationsPage() {
   const [notifications, setNotifications] = useState(initialNotifications);
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                     <Bell className="h-6 w-6 text-primary" />
                     Notifications
                     {unreadCount > 0 && (
                        <span className="px-2 py-1 bg-primary text-white text-sm rounded-full">
                           {unreadCount} new
                        </span>
                     )}
                  </h1>
                  <div className="flex items-center gap-4">
                     {notifications.length > 0 && (
                        <>
                           <button
                              onClick={handleMarkAllAsRead}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                           >
                              <Check className="h-4 w-4" />
                              Mark all as read
                           </button>
                           <button
                              onClick={handleClearAll}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-error hover:text-red-700 transition-colors"
                           >
                              <Trash2 className="h-4 w-4" />
                              Clear all
                           </button>
                        </>
                     )}
                  </div>
               </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
               {notifications.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                     <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                     <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
                     <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
                  </div>
               ) : (
                  notifications.map((notification) => (
                     <div
                        key={notification.id}
                        className={`relative group p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all ${!notification.read ? 'border-l-4 border-primary' : ''
                           }`}
                     >
                        <div className="flex items-start gap-4">
                           <div className={`p-2 rounded-lg ${!notification.read
                                 ? 'bg-primary/10 text-primary'
                                 : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                              }`}>
                              <NotificationIcon type={notification.type} />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white">
                                 {notification.content}
                              </p>
                              {(notification.relatedPostTitle || notification.relatedResourceName || notification.groupName) && (
                                 <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {notification.relatedPostTitle || notification.relatedResourceName || notification.groupName}
                                 </p>
                              )}
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                 {formatTimeAgo(new Date(notification.timestamp))}
                              </p>
                           </div>
                           <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="p-1.5 text-gray-400 hover:text-error rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete notification"
                           >
                              <X className="h-4 w-4" />
                           </button>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
   );
}

export default NotificationsPage;
