import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { Sun, Moon, Bell, LogOut, User, LayoutDashboard, Newspaper, ShieldCheck, Menu, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';

const AdminNavbar = () => {
  const { isDark, toggleTheme } = useTheme();
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

  const activeLinkClass = 'bg-blue-600 text-white dark:text-white';
  const inactiveLinkClass = 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white';

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Admin Tag */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-blue-500" />
              <span className="text-gray-900 dark:text-white text-xl font-bold">CUET Sphere</span>
            </Link>
            <span className="ml-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">ADMIN</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? activeLinkClass : inactiveLinkClass}`
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
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
            <Link
              to="/admin/notifications"
              className="relative p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-red-600 hover:text-white dark:text-gray-300 dark:hover:bg-red-600 dark:hover:text-white transition-colors"
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
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
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive ? activeLinkClass : inactiveLinkClass}`
                }
              >
                <link.icon className="h-5 w-5" />
                {link.name}
              </NavLink>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 p-1.5 rounded-full bg-gray-700 text-white" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">{user?.fullName}</div>
                <div className="text-sm font-medium leading-none text-gray-400">{user?.email}</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Link
                  to="/admin/notifications"
                  className="relative p-2 rounded-full text-gray-400 hover:text-white"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-gray-400 hover:text-white"
                >
                  {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                </button>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
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
