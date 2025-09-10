import React, { createContext, useContext, useState, useEffect } from 'react';
import NotificationService from '../services/notificationService';
import { useUser } from './UserContext';

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
   const [notifications, setNotifications] = useState([]);
   const [unreadCount, setUnreadCount] = useState(0);
   const [loading, setLoading] = useState(true);
   const { user } = useUser();

   // Load notifications on mount and when user changes
   useEffect(() => {
      if (user) {
         loadNotifications();
         loadUnreadCount();
      } else {
         setNotifications([]);
         setUnreadCount(0);
         setLoading(false);
      }
   }, [user]);

   const loadNotifications = async () => {
      try {
         setLoading(true);
         const data = await NotificationService.getUserNotifications();
         setNotifications(data || []);
      } catch (error) {
         console.error('Error loading notifications:', error);
         setNotifications([]);
      } finally {
         setLoading(false);
      }
   };

   const loadUnreadCount = async () => {
      try {
         const count = await NotificationService.getUnreadCount();
         setUnreadCount(count || 0);
      } catch (error) {
         console.error('Error loading unread count:', error);
         setUnreadCount(0);
      }
   };

   // Refresh notifications (called after actions that might create notifications)
   const refreshNotifications = () => {
      if (user) {
         loadNotifications();
         loadUnreadCount();
      }
   };

   const markAsRead = async (id) => {
      try {
         await NotificationService.markAsRead(id);
         setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
         );
         setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
         console.error('Error marking notification as read:', error);
      }
   };

   const markAllAsRead = async () => {
      try {
         await NotificationService.markAllAsRead();
         setNotifications(prev =>
            prev.map(n => ({ ...n, isRead: true }))
         );
         setUnreadCount(0);
      } catch (error) {
         console.error('Error marking all notifications as read:', error);
      }
   };

   const deleteNotification = async (id) => {
      try {
         await NotificationService.deleteNotification(id);
         const notification = notifications.find(n => n.id === id);
         setNotifications(prev => prev.filter(n => n.id !== id));
         if (notification && !notification.isRead) {
            setUnreadCount(prev => Math.max(0, prev - 1));
         }
      } catch (error) {
         console.error('Error deleting notification:', error);
      }
   };

   const clearAll = async () => {
      try {
         await NotificationService.clearAllNotifications();
         setNotifications([]);
         setUnreadCount(0);
      } catch (error) {
         console.error('Error clearing all notifications:', error);
      }
   };

   return (
      <NotificationsContext.Provider
         value={{
            notifications,
            unreadCount,
            loading,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            clearAll,
            refreshNotifications
         }}
      >
         {children}
      </NotificationsContext.Provider>
   );
}

export function useNotifications() {
   const context = useContext(NotificationsContext);
   if (context === undefined) {
      throw new Error('useNotifications must be used within a NotificationsProvider');
   }
   return context;
}
