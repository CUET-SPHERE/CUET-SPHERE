import React from 'react';
import useWindowDimensions from '../hooks/useWindowDimensions';
import RecentFeed from '../components/RecentFeed';
import AcademicResources from '../components/AcademicResources';
import { ResourcesProvider } from '../contexts/ResourcesContext';
import { ResourceNavigationProvider } from '../contexts/ResourceNavigationContext';
import { useTheme } from '../contexts/ThemeContext';

function ResourcesPage() {
  const { height } = useWindowDimensions();
  const { theme, isDark } = useTheme();

  // Calculate the available height for content (total height minus header, padding, etc.)
  const availableHeight = height - 160; // Adjust based on your header height

  return (
    <ResourcesProvider>
      <ResourceNavigationProvider>
        <div className={`max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 ${isDark ? 'bg-background' : 'bg-gray-50'} transition-colors duration-300`}>
          <div className="flex flex-col lg:flex-row gap-6 justify-center" style={{ height: availableHeight }}>
            {/* Academic resources - 55% */}
            <div className="w-full lg:w-[55%] h-full">
              <AcademicResources />
            </div>
            {/* Recent uploads - 30% */}
            <div className="w-full lg:w-[30%] h-full">
              <RecentFeed />
            </div>
            {/* The remaining 15% is left as padding on both sides */}
          </div>
        </div>
      </ResourceNavigationProvider>
    </ResourcesProvider>
  );
}

export default ResourcesPage;
