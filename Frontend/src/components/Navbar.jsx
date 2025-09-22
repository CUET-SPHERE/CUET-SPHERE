import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Moon, Sun, GraduationCap, Menu, X, Home, BookOpen, Users, User, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationsContext';

// Tabs for logged in users
const getNavTabs = (userRole) => {
  const baseTabs = [
    { label: 'Feed', to: '/feed', icon: Home },
    { label: 'Resources', to: '/resources', icon: BookOpen },
    { label: 'My Group', to: '/group', icon: Users },
    { label: 'Profile', to: '/profile', icon: User },
  ];

  // Only show Dashboard tab for SYSTEM_ADMIN
  if (userRole === 'SYSTEM_ADMIN') {
    return [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      ...baseTabs
    ];
  }

  return baseTabs;
};

export function LoggedInNavbar() {
  const location = useLocation();
  const { user, logout } = useUser();
  const { theme, toggleTheme, isDark, colors, buttonClasses } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const { unreadCount: notificationCount } = useNotifications();
  const navTabs = getNavTabs(user?.role);

  return (
    <nav className={`${colors?.surface || 'bg-white dark:bg-surface'} shadow-sm ${colors?.border || 'border-gray-200 dark:border-border-color'} border-b sticky top-0 z-50`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 justify-between">
          {/* Logo */}
          <Link to={user?.role === 'SYSTEM_ADMIN' ? '/dashboard' : '/feed'} className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              CUETSphere
            </span>
          </Link>

          {/* Desktop Navigation - Only visible on screens >= 1000px */}
          <div className="hidden lg:flex items-center ml-12 space-x-8">
            {navTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`relative flex items-center gap-2 text-base font-medium px-2 py-1.5 transition-colors duration-200 ${location.pathname.startsWith(tab.to)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                >
                  <IconComponent className="h-5 w-5" />
                  {tab.label}
                  {location.pathname.startsWith(tab.to) && (
                    <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side: Theme Toggle, Notification and Menu/Logout */}
          <div className="flex items-center space-x-6">
            {/* Theme Toggle - Always visible */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            {/* Notification Bell - Always visible */}
            <Link to="/notifications" className="relative">
              <button className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[20px] text-center">
                    {notificationCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Logout Button - Only visible on large screens */}
            <button
              onClick={logout}
              className="hidden lg:block px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              Logout
            </button>

            {/* Mobile Menu Button - Only visible on screens < 1000px */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Only visible when menu is open and on screens < 1000px */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t border-gray-200 dark:border-gray-600 mt-1">
            {navTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${location.pathname.startsWith(tab.to)
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <IconComponent className="h-5 w-5" />
                  {tab.label}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
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
      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${location.pathname === to
        ? 'bg-blue-600 dark:bg-blue-500 text-white'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
            <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              CUETSphere
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'SYSTEM_ADMIN' && <NavLink to="/dashboard">Dashboard</NavLink>}
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user?.fullName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
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
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
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
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              aria-label="Toggle theme"
            >
              {theme === 'light' ?
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" /> :
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              }
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              aria-label="Toggle menu"
            >
              {isMenuOpen ?
                <X className="h-5 w-5 text-gray-700 dark:text-gray-300" /> :
                <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {isAuthenticated ? (
              <>
                {user?.role === 'SYSTEM_ADMIN' && (
                  <NavLink to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </NavLink>
                )}
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user?.fullName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
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
