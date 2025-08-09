import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider, useUser } from './contexts/UserContext';

// Navbars
import { LoggedOutNavbar, LoggedInNavbar } from './components/Navbar';
import AdminNavbar from './components/admin/AdminNavbar';
import Footer from './components/Footer';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Student/CR Pages
import StudentDashboard from './pages/StudentDashboard';
import FeedPage from './pages/FeedPage';
import MyGroupPage from './pages/MyGroupPage';
import ResourcesPage from './pages/ResourcesPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFeedPage from './pages/admin/AdminFeedPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';

// Route Protection Components
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useUser();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useUser();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return user.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useUser();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
  const { isAuthenticated, user } = useUser();
  const location = useLocation();

  const renderNavbar = () => {
    if (!isAuthenticated) {
      return <LoggedOutNavbar />;
    }
    if (user.role === 'admin') {
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

          {/* Student & CR Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
          <Route path="/group" element={<ProtectedRoute><MyGroupPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/feed" element={<AdminRoute><AdminFeedPage /></AdminRoute>} />
          <Route path="/admin/profile" element={<AdminRoute><AdminProfilePage /></AdminRoute>} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
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
        <Router>
          <AppContent />
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
