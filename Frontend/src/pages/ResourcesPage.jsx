import React from 'react';
import useWindowDimensions from '../hooks/useWindowDimensions';
import FolderSidebar from '../components/FolderSidebar';
import RecentFeed from '../components/RecentFeed';
import AcademicResources from '../components/AcademicResources';
import { ResourcesProvider } from '../contexts/ResourcesContext';

function ResourcesPage() {
  const { height } = useWindowDimensions();
  
  return (
    <ResourcesProvider>
      <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6" style={{ minHeight: height - 160 }}>
          {/* Left sidebar */}
          <div className="w-full lg:w-1/4">
            <FolderSidebar />
          </div>
          {/* Center recent feed */}
          <div className="w-full lg:w-1/4">
            <RecentFeed />
          </div>
          {/* Right academic resources */}
          <div className="w-full lg:w-1/2">
            <AcademicResources />
          </div>
        </div>
      </div>
    </ResourcesProvider>
  );
}

export default ResourcesPage;
