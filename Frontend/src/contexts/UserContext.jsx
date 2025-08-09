import React, { createContext, useContext, useState, useEffect } from 'react';

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
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
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
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    // Reset delete count on new admin login if desired, or persist across sessions
    if (userData.role !== 'admin') {
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

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    postDeleteCount,
    incrementPostDeleteCount,
  };

  return (
    <UserContext.Provider value={value}>
      {!isLoading && children}
    </UserContext.Provider>
  );
};
