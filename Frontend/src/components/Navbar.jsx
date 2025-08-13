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
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const notificationCount = 3;

  return (
    <nav className="bg-white dark:bg-surface shadow-sm border-b border-gray-200 dark:border-border-color sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold text-primary">CUETSphere</span>
          </Link>
          
          {/* Desktop Navigation - Only visible on screens >= 1000px */}
          <div className="hidden lg:flex items-center space-x-6">
            {navTabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                className={`relative text-base font-medium px-1 pb-1 transition-colors duration-200 ${
                  location.pathname.startsWith(tab.to)
                    ? 'text-primary' : 'text-gray-700 dark:text-text-secondary hover:text-primary'
                }`}
              >
                {tab.label}
                {location.pathname.startsWith(tab.to) && (
                  <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-primary rounded"></span>
                )}
              </Link>
            ))}
          </div>
          
          {/* Right side: Theme Toggle, Notification and Menu/Logout */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle - Always visible */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-700 dark:text-text-secondary hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
            
            {/* Notification Bell - Always visible */}
            <div className="relative">
              <Bell className="h-6 w-6 text-gray-700 dark:text-text-secondary" />
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                {notificationCount}
              </span>
            </div>
            
            {/* Logout Button - Only visible on large screens */}
            <button
              onClick={logout}
              className="hidden lg:block px-3 py-1.5 bg-error text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
            >
              Logout
            </button>
            
            {/* Mobile Menu Button - Only visible on screens < 1000px */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-text-secondary"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu - Only visible when menu is open and on screens < 1000px */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t border-gray-200 dark:border-border-color mt-1">
            {navTabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${
                  location.pathname.startsWith(tab.to)
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 dark:text-text-secondary hover:bg-gray-100 dark:hover:bg-neutral-700'
                }`}
              >
                {tab.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 bg-error text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        )}
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
          ? 'bg-primary text-white'
          : 'text-gray-700 dark:text-text-secondary hover:bg-gray-100 dark:hover:bg-neutral-700'
      }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white dark:bg-surface shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              CUETSphere
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-neutral-700 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-text-secondary">
                    {user?.fullName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-error text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
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
              className="p-2 rounded-full text-gray-700 dark:text-text-secondary hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-700"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5 text-gray-700 dark:text-text-secondary" /> : <Sun className="h-5 w-5 text-gray-700 dark:text-text-secondary" />}
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-700"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5 text-gray-700 dark:text-text-secondary" /> : <Menu className="h-5 w-5 text-gray-700 dark:text-text-secondary" />}
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
                <div className="px-4 py-2 bg-gray-100 dark:bg-neutral-700 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-text-secondary">
                    {user?.fullName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 bg-error text-white rounded-lg hover:bg-red-600"
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
