import React, { useState } from 'react';
import { Switch } from '@headlessui/react';
import clsx from 'clsx';
import PostFeed from '../../components/PostFeed';
import { ShieldAlert } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const AdminFeedPage = () => {
  const { isDark, colors } = useTheme();
  const [manageMode, setManageMode] = useState(false);

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: isDark ? colors.background.dark : colors.background.light }}
    >
      {/* Sticky Header Section - Correctly offset from the top */}
      <header
        className="sticky top-16 z-30 backdrop-blur-sm border-b p-4 sm:p-6 shadow-sm"
        style={{
          backgroundColor: isDark ? `${colors.background.cardDark}CC` : `${colors.background.cardLight}F2`,
          borderColor: isDark ? colors.interactive.borderDark : colors.interactive.border
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: isDark ? colors.text.primaryDark : colors.text.primaryLight }}
              >
                Feed Management
              </h1>
              <p
                className="mt-1"
                style={{ color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight }}
              >
                View and manage all posts on the platform.
              </p>
            </div>

            {/* Manage Mode Toggle */}
            <div
              className="flex items-center gap-3 mt-4 sm:mt-0 p-3 rounded-lg"
              style={{ backgroundColor: isDark ? colors.status.general.dark : colors.status.general.light }}
            >
              <span
                className="font-medium text-sm"
                style={{
                  color: manageMode
                    ? colors.status.error.lightText
                    : (isDark ? colors.text.secondaryDark : colors.text.secondaryLight)
                }}
              >
                Manage Mode
              </span>
              <Switch
                checked={manageMode}
                onChange={setManageMode}
                className={clsx(
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2',
                  manageMode ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-600'
                )}
                style={{
                  backgroundColor: manageMode ? colors.status.error.lightText : (isDark ? colors.interactive.hoverDark : colors.interactive.hover),
                  focusRingColor: colors.primary.blue
                }}
              >
                <span
                  aria-hidden="true"
                  className={clsx(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    manageMode ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </Switch>
            </div>
          </div>
          {manageMode && (
            <div
              className="mt-4 p-3 border-l-4 rounded-r-lg flex items-center gap-3"
              style={{
                backgroundColor: isDark ? colors.status.error.dark : colors.status.error.light,
                borderColor: colors.status.error.lightText
              }}
            >
              <ShieldAlert
                className="h-5 w-5"
                style={{ color: isDark ? colors.status.error.darkText : colors.status.error.lightText }}
              />
              <p
                className="text-sm"
                style={{ color: isDark ? colors.status.error.darkText : colors.status.error.lightText }}
              >
                <strong>Manage Mode is active.</strong> You can now delete posts. This action is permanent and cannot be undone.
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="max-w-4xl mx-auto">
          <PostFeed isManageMode={manageMode} />
        </div>
      </main>
    </div>
  );
};

export default AdminFeedPage;
