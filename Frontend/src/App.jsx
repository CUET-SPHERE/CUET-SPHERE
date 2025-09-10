import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { NotificationsProvider } from './contexts/NotificationsContext';

// Navbars
import { LoggedOutNavbar, LoggedInNavbar } from './components/Navbar';
import AdminNavbar from './components/admin/AdminNavbar';
import Footer from './components/Footer';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Student/CR Pages
import StudentDashboard from './pages/StudentDashboard';
import FeedPage from './pages/FeedPage';
import MyGroupPage from './pages/MyGroupPage';
import ResourcesPage from './pages/ResourcesPage';
import ProfilePage from './pages/ProfilePage';

// Student Pages
import NotificationsPage from './pages/NotificationsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFeedPage from './pages/admin/AdminFeedPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';

// Route Protection Components
import ProtectedRoute from './components/ProtectedRoute';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useUser();
  const redirectTo = user?.role === 'SYSTEM_ADMIN' ? '/admin/dashboard' : '/feed';
  return !isAuthenticated ? children : <Navigate to={redirectTo} />;
};

function AppContent() {
  const { isAuthenticated, user } = useUser();
  const location = useLocation();

  const renderNavbar = () => {
    if (!isAuthenticated) {
      return <LoggedOutNavbar />;
    }
    if (user?.role === 'SYSTEM_ADMIN') {
      return <AdminNavbar />;
    }
    return <LoggedInNavbar />;
  };

  const showFooter = !isAuthenticated && location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {renderNavbar()}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><VerifyOtpPage /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

          {/* Admin Only Dashboard Route */}
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="SYSTEM_ADMIN"><StudentDashboard /></ProtectedRoute>} />
          {/* Protected User Routes */}
          <Route 
            path="/feed" 
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
          <Route path="/group" element={<ProtectedRoute><MyGroupPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="SYSTEM_ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/feed" element={<ProtectedRoute requiredRole="SYSTEM_ADMIN"><AdminFeedPage /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute requiredRole="SYSTEM_ADMIN"><AdminProfilePage /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute requiredRole="SYSTEM_ADMIN"><AdminNotificationsPage /></ProtectedRoute>} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to={isAuthenticated ? (user?.role === 'SYSTEM_ADMIN' ? "/admin/dashboard" : "/feed") : "/"} />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationsProvider>
          <Router>
            <div className="app-container">
              <AppContent />
            </div>
          </Router>
        </NotificationsProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
