import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Moon, Sun, GraduationCap, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

// Tabs for logged in users
const navTabs = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Feed', to: '/feed' },
  { label: 'Resources', to: '/resources' },
  { label: 'My Group', to: '/group' },
  { label: 'Profile', to: '/profile' },
];

export function LoggedInNavbar() {
  const location = useLocation();
  const { user, logout } = useUser();
  // Mock notification count and user initial
  const notificationCount = 3;
  const userInitial = user?.fullName?.charAt(0) || 'S';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto px-10 sm:px-12 lg:px-16">
        <div className="flex items-center h-16 justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold text-blue-600">CUETSphere</span>
          </Link>
          {/* Tabs */}
          <div className="flex items-center space-x-6">
            {navTabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                className={`relative text-base font-medium px-1 pb-1 transition-colors duration-200 ${
                  (location.pathname === tab.to || (tab.to === '/dashboard#resources' && location.hash === '#resources'))
                    ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {tab.label}
                {(location.pathname === tab.to || (tab.to === '/dashboard#resources' && location.hash === '#resources')) && (
                  <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-500 rounded"></span>
                )}
              </Link>
            ))}
            {/* Role-specific tabs */}
            {user?.role === 'cr' && (
              <Link
                to="/cr-panel"
                className={`relative text-base font-medium px-1 pb-1 transition-colors duration-200 ${
                  location.pathname === '/cr-panel' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                CR Panel
                {location.pathname === '/cr-panel' && (
                  <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-500 rounded"></span>
                )}
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin-panel"
                className={`relative text-base font-medium px-1 pb-1 transition-colors duration-200 ${
                  location.pathname === '/admin-panel' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Admin Panel
                {location.pathname === '/admin-panel' && (
                  <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-500 rounded"></span>
                )}
              </Link>
            )}
          </div>
          {/* Right side: Notification and User */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-700" />
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                {notificationCount}
              </span>
            </div>
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-700">
              {userInitial}
            </div>
            {/* Logout Button */}
            <button
              onClick={logout}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function LoggedOutNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useUser();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const NavLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
        location.pathname === to
          ? 'bg-blue-600 text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              CUETSphere
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user?.fullName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/signup">Sign Up</NavLink>
              </>
            )}
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </NavLink>
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user?.fullName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>
                  Login
                </NavLink>
                <NavLink to="/signup" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
