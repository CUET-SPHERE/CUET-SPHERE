import React, { useState } from 'react';
import { Switch } from '@headlessui/react';
import clsx from 'clsx';
import PostFeed from '../../components/PostFeed';
import { ShieldAlert } from 'lucide-react';

const AdminFeedPage = () => {
  const [manageMode, setManageMode] = useState(false);

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      {/* Sticky Header Section - Correctly offset from the top */}
      <header className="sticky top-16 z-30 bg-white/95 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feed Management</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                View and manage all posts on the platform.
              </p>
            </div>
            
            {/* Manage Mode Toggle */}
            <div className="flex items-center gap-3 mt-4 sm:mt-0 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
              <span className={clsx(
                "font-medium text-sm",
                manageMode ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
              )}>
                Manage Mode
              </span>
              <Switch
                checked={manageMode}
                onChange={setManageMode}
                className={clsx(
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
                  manageMode ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-600'
                )}
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
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-300">
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
