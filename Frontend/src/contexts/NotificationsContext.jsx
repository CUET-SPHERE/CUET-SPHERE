import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockNotifications } from '../mock/mockNotifications';

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
   const [notifications, setNotifications] = useState(mockNotifications);
   const [unreadCount, setUnreadCount] = useState(0);

   useEffect(() => {
      setUnreadCount(notifications.filter(n => !n.read).length);
   }, [notifications]);

   const addNotification = (notification) => {
      setNotifications(prev => [
         {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
         },
         ...prev
      ]);
   };

   const markAsRead = (id) => {
      setNotifications(prev =>
         prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
   };

   const markAllAsRead = () => {
      setNotifications(prev =>
         prev.map(n => ({ ...n, read: true }))
      );
   };

   const deleteNotification = (id) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
   };

   const clearAll = () => {
      setNotifications([]);
   };

   return (
      <NotificationsContext.Provider
         value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            clearAll
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
