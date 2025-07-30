import React from 'react';
import useWindowDimensions from '../hooks/useWindowDimensions';
import FolderSidebar from '../components/FolderSidebar';
import RecentFeed from '../components/RecentFeed';
import AcademicResources from '../components/AcademicResources';

function ResourcesPage() {
  const { height, width } = useWindowDimensions();
  return (
    <div className="max-w-screen-2xl  m-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex  flex-row gap-6" style={{ height: height - 160 }}>
        {/* Left sidebar (25%) */}
        <div style={{ width: width * 0.25 }}>
          <FolderSidebar />
        </div>
        {/* Center recent feed (25%) */}
        <div style={{ width: width * 0.25 }}>
          <RecentFeed />
        </div>
        {/* Right academic resources */}
        <div style={{ width: width * 0.5 }}>
          <AcademicResources />
        </div>
      </div>
    </div>
  );
}

export default ResourcesPage;
