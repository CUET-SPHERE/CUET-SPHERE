import React from 'react';
import useWindowDimensions from '../hooks/useWindowDimensions';
import RecentFeed from '../components/RecentFeed';
import AcademicResources from '../components/AcademicResources';
import { ResourcesProvider } from '../contexts/ResourcesContext';
import { useTheme } from '../contexts/ThemeContext';

function ResourcesPage() {
  const { height } = useWindowDimensions();
  const { theme, isDark } = useTheme();

  return (
    <ResourcesProvider>
      <div className={`max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 ${isDark ? 'bg-background' : 'bg-gray-50'} transition-colors duration-300`}>
        <div className="flex flex-col lg:flex-row gap-6 justify-center" style={{ minHeight: height - 160 }}>
          {/* Academic resources - 55% */}
          <div className="w-full lg:w-[55%]">
            <AcademicResources />
          </div>
          {/* Recent uploads - 30% */}
          <div className="w-full lg:w-[30%]">
            <RecentFeed />
          </div>
          {/* The remaining 15% is left as padding on both sides */}
        </div>
      </div>
    </ResourcesProvider>
  );
}

export default ResourcesPage;
