import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [postDeleteCount, setPostDeleteCount] = useState(0);

  useEffect(() => {
    const initializeUser = () => {
      try {
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          // Check if token exists
          if (parsedUser.token) {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('user');
          }
        } else {
          // No user data in localStorage
        }

        const storedDeleteCount = localStorage.getItem('postDeleteCount');
        if (storedDeleteCount) {
          setPostDeleteCount(parseInt(storedDeleteCount, 10));
        }
      } catch (error) {
        console.error("Failed to parse data from localStorage", error);
        localStorage.removeItem('user');
        localStorage.removeItem('postDeleteCount');
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const login = (userData) => {
    // Ensure userData has the required fields
    const userWithToken = {
      ...userData,
      token: userData.token || userData.jwt,
      role: userData.role || 'STUDENT'
    };

    setUser(userWithToken);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userWithToken));

    // Reset delete count on new admin login if desired, or persist across sessions
    if (userWithToken.role !== 'SYSTEM_ADMIN') {
      localStorage.removeItem('postDeleteCount');
      setPostDeleteCount(0);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    // Optionally clear delete count on logout
    // localStorage.removeItem('postDeleteCount');
    // setPostDeleteCount(0);
  };

  const updateUser = (updatedData) => {
    if (!user) return;
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const incrementPostDeleteCount = () => {
    setPostDeleteCount(prevCount => {
      const newCount = prevCount + 1;
      localStorage.setItem('postDeleteCount', newCount.toString());
      return newCount;
    });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('SYSTEM_ADMIN');
  };

  // Check if user is CR
  const isCR = () => {
    return hasRole('CR');
  };

  // Check if user is student
  const isStudent = () => {
    return hasRole('STUDENT');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    postDeleteCount,
    incrementPostDeleteCount,
    hasRole,
    isAdmin,
    isCR,
    isStudent,
  };

  return (
    <UserContext.Provider value={value}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </UserContext.Provider>
  );
};
