import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { Sun, Moon, Bell, LogOut, User, LayoutDashboard, Newspaper, ShieldCheck, Menu, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';

const AdminNavbar = () => {
  const { theme, toggleTheme, isDark, colors } = useTheme();
  const { user, logout } = useUser();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Feed', path: '/admin/feed', icon: Newspaper },
    { name: 'Profile', path: '/admin/profile', icon: User },
  ];

  // Using centralized colors
  const activeLinkStyle = {
    backgroundColor: colors.primary.blue,
    color: colors.text.primaryDark
  };

  const inactiveLinkStyle = isDark ? {
    color: colors.text.secondaryDark,
  } : {
    color: colors.text.secondaryLight,
  };

  const hoverStyle = isDark ? {
    backgroundColor: colors.interactive.hoverDark,
    color: colors.text.primaryDark
  } : {
    backgroundColor: colors.interactive.hover,
    color: colors.text.primaryLight
  };

  return (
    <nav
      className="shadow-md sticky top-0 z-50"
      style={{
        backgroundColor: isDark ? colors.background.cardDark : colors.background.cardLight
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Admin Tag */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <ShieldCheck className="h-8 w-8" style={{ color: colors.primary.blue }} />
              <span
                className="text-xl font-bold"
                style={{ color: isDark ? colors.text.primaryDark : colors.text.primaryLight }}
              >
                CUET Sphere
              </span>
            </Link>
            <span
              className="ml-3 text-white text-xs font-bold px-2 py-1 rounded-md"
              style={{ backgroundColor: colors.status.error.lightText }}
            >
              ADMIN
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={({ isActive }) =>
                    isActive
                      ? activeLinkStyle
                      : inactiveLinkStyle
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight,
                backgroundColor: 'transparent',
                borderColor: colors.interactive.focus
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = isDark ? colors.interactive.hoverDark : colors.interactive.hover;
                e.target.style.color = isDark ? colors.text.primaryDark : colors.text.primaryLight;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = isDark ? colors.text.secondaryDark : colors.text.secondaryLight;
              }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
            <Link
              to="/admin/notifications"
              className="relative p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight,
                borderColor: colors.interactive.focus
              }}
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center"
                  style={{ backgroundColor: colors.status.error.lightText }}
                >
                  {unreadCount}
                </span>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              style={{
                color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.status.error.lightText;
                e.target.style.color = colors.text.primaryDark;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = isDark ? colors.text.secondaryDark : colors.text.secondaryLight;
              }}
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md transition-colors focus:outline-none"
              style={{
                color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = isDark ? colors.interactive.hoverDark : colors.interactive.hover;
                e.target.style.color = isDark ? colors.text.primaryDark : colors.text.primaryLight;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = isDark ? colors.text.secondaryDark : colors.text.secondaryLight;
              }}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors"
                style={({ isActive }) =>
                  isActive
                    ? activeLinkStyle
                    : inactiveLinkStyle
                }
              >
                <link.icon className="h-5 w-5" />
                {link.name}
              </NavLink>
            ))}
          </div>
          <div
            className="pt-4 pb-3 border-t"
            style={{ borderColor: isDark ? colors.interactive.borderDark : colors.interactive.border }}
          >
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <User
                  className="h-8 w-8 p-1.5 rounded-full text-white"
                  style={{ backgroundColor: isDark ? colors.interactive.hoverDark : colors.interactive.hover }}
                />
              </div>
              <div className="ml-3">
                <div
                  className="text-base font-medium leading-none"
                  style={{ color: isDark ? colors.text.primaryDark : colors.text.primaryLight }}
                >
                  {user?.fullName}
                </div>
                <div
                  className="text-sm font-medium leading-none"
                  style={{ color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight }}
                >
                  {user?.email}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Link
                  to="/admin/notifications"
                  className="relative p-2 rounded-full transition-colors"
                  style={{ color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight }}
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center"
                      style={{ backgroundColor: colors.status.error.lightText }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full transition-colors"
                  style={{ color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight }}
                >
                  {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                </button>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors"
                style={{
                  color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = isDark ? colors.interactive.hoverDark : colors.interactive.hover;
                  e.target.style.color = isDark ? colors.text.primaryDark : colors.text.primaryLight;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = isDark ? colors.text.secondaryDark : colors.text.secondaryLight;
                }}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
