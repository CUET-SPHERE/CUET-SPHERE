import React from 'react';
import { useResources } from '../contexts/ResourcesContext';
import { useResourceNavigation } from '../contexts/ResourceNavigationContext';
import { AlertCircle } from 'lucide-react';
import { getInitials, getAvatarColor } from '../utils/formatters';

// Avatar component (same as PostCard and AcademicResources)
const Avatar = React.memo(({ src, name, size = 'md' }) => {
  const sizeClasses = {
    xs: 'w-5 h-5 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 dark:border-gray-600`}
      />
    );
  }

  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  return (
    <div className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-medium`}>
      {initials}
    </div>
  );
});

const departmentMap = {
  '04': 'CSE',
  '01': 'CE',
  '02': 'EEE',
  '03': 'ME',
  '05': 'ETE',
};

// Function to format student ID as batch+dept+id (e.g., 2204094)
const formatStudentId = (studentId) => {
  if (!studentId || typeof studentId !== 'string' || studentId.length < 4) return null;

  // Return the original student ID format (e.g., 2204094)
  // No conversion to department abbreviations, just use the department code
  return studentId;
};

function RecentFeed() {
  const { resources, loading, error } = useResources();
  const { navigateToResource } = useResourceNavigation();

  // Get top 7 most recent resources
  const recentFiles = resources.length > 0 ?
    [...resources]
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, 7)
    : [];

  // Handle clicking on a recent upload item
  const handleResourceClick = (resource) => {
    console.log('Clicked on recent upload:', resource);
    navigateToResource(resource);
  };

  return (
    <div className="bg-white dark:bg-surface rounded-2xl shadow-2xl p-4 flex flex-col h-full border border-gray-200 dark:border-border-color">
      <h3 className="text-lg font-bold text-gray-800 dark:text-text-primary mb-4 shrink-0">Recent Uploads</h3>
      <div className="space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pr-2 flex-grow min-h-0">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-border-color rounded-lg">
            <AlertCircle className="mx-auto text-error mb-2" size={24} />
            <p className="text-error">{error}</p>
          </div>
        ) : recentFiles.length > 0 ? (
          recentFiles.map((res) => (
            <div
              key={res.id}
              onClick={() => handleResourceClick(res)}
              className="flex items-center justify-between bg-gray-100 dark:bg-background rounded-lg p-4 border border-gray-200 dark:border-border-color hover:shadow-md transition-all hover:border-primary cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 group"
              title="Click to navigate to this resource in Academic Resources"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Upload Icon */}
                <div className="bg-primary/10 rounded-lg p-2 shrink-0 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Resource Upload Summary */}
                  <div className="font-medium text-gray-800 dark:text-text-primary group-hover:text-primary transition-colors">
                    A resource {res.isFolder && res.fileCount > 1 ? `(${res.fileCount} files)` : '(1 file)'} was uploaded
                  </div>

                  {/* Course and Semester Information */}
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    under course <span className="font-medium text-gray-700 dark:text-gray-300">{res.courseName || res.courseCode}</span> for semester <span className="font-medium text-gray-700 dark:text-gray-300">{res.semesterName || `${res.level}-${res.term}`}</span>
                  </div>

                  {/* Resource Title */}
                  <div className="text-sm text-gray-500 dark:text-text-secondary mt-1 truncate">
                    Title: "{res.title}"
                  </div>

                  {/* Uploader Information and Upload Date */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-text-secondary mt-2">
                    <Avatar src={res.uploaderProfilePicture} name={res.uploaderName} size="xs" />
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {res.uploaderName || 'Unknown'}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span>Student ID: {formatStudentId(res.uploaderStudentId) || res.uploaderStudentId || 'Unknown'}</span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span>
                        {new Date(res.uploadedAt || res.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-border-color rounded-lg">
            <p className="text-gray-500 dark:text-text-secondary">No recent uploads.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentFeed;
