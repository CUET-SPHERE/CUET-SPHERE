import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Trash2, Check, MessageSquare, Heart, Share2, Users, FileText, X, RefreshCw } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters';
import { useNotifications } from '../contexts/NotificationsContext';

function NotificationIcon({ type }) {
   const icons = {
      post_comment: MessageSquare,
      comment_reply: MessageSquare,
      new_post_admin: FileText,
      welcome: Heart,
      post_like: Heart,
      mention: MessageSquare,
      resource_share: FileText,
      group_invite: Users
   };

   const Icon = icons[type] || Bell;

   return <Icon className="h-5 w-5" />;
}

function NotificationsPage() {
   const { 
      notifications, 
      unreadCount, 
      loading, 
      markAsRead, 
      markAllAsRead, 
      deleteNotification, 
      clearAll,
      refreshNotifications 
   } = useNotifications();

   const handleClearAll = () => {
      if (notifications.length === 0) return;
      if (window.confirm('Are you sure you want to clear all notifications?')) {
         clearAll();
      }
   };

   const handleDeleteNotification = (id) => {
      deleteNotification(id);
   };

   const handleMarkAllAsRead = () => {
      markAllAsRead();
   };

   const handleNotificationClick = (notification) => {
      if (!notification.isRead) {
         markAsRead(notification.id);
      }
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center py-12">
                  <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
               </div>
            </div>
         </div>
      );
   }

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
                     <button
                        onClick={refreshNotifications}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                        title="Refresh notifications"
                     >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                     </button>
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
                        className={`relative group p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md ${!notification.isRead ? 'border-l-4 border-primary' : ''
                           }`}
                        onClick={() => handleNotificationClick(notification)}
                     >
                        <div className="flex items-start gap-4">
                           <div className={`p-2 rounded-lg ${!notification.isRead
                                 ? 'bg-primary/10 text-primary'
                                 : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                              }`}>
                              <NotificationIcon type={notification.type} />
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                 {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                 {notification.message}
                              </p>
                              {notification.actorUserName && (
                                 <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    by {notification.actorUserName}
                                 </p>
                              )}
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                 {formatTimeAgo(new Date(notification.createdAt))}
                              </p>
                           </div>
                           <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleDeleteNotification(notification.id);
                              }}
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
