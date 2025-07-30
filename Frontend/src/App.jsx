import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { LoggedOutNavbar, LoggedInNavbar } from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StudentDashboard from './pages/StudentDashboard';
import FeedPage from './pages/FeedPage';
import MyGroupPage from './pages/MyGroupPage';
import ResourcesPage from './pages/ResourcesPage';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useUser();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useUser();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
  const { isAuthenticated } = useUser();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {isAuthenticated ? <LoggedInNavbar /> : <LoggedOutNavbar />}
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/feed" 
              element={<FeedPage />} 
            />
            <Route 
              path="/resources" 
              element={
                <ProtectedRoute>
                  <ResourcesPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/group" 
              element={
                <ProtectedRoute>
                  <MyGroupPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        {!isAuthenticated && <Footer />}
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;