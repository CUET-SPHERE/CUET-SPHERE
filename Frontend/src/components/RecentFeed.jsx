import React from 'react';
import { useResources } from '../contexts/ResourcesContext';
import { useResourceNavigation } from '../contexts/ResourceNavigationContext';
import { useTheme } from '../contexts/ThemeContext';
import { AlertCircle } from 'lucide-react';
import { getInitials, getAvatarColor } from '../utils/formatters';

// Avatar component (same as PostCard and AcademicResources)
const Avatar = React.memo(({ src, name, size = 'md' }) => {
  const { colors } = useTheme();
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
        className={`${sizeClasses[size]} rounded-full object-cover border-2 ${colors?.border || 'border-gray-200 dark:border-gray-600'}`}
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
  const { colors, isDark } = useTheme();

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
    <div className={`${colors?.glass || (isDark ? 'bg-slate-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm')} rounded-2xl ${colors?.shadow || 'shadow-xl'} ${colors?.shadowHover || 'hover:shadow-2xl'} p-4 flex flex-col h-full ${colors?.border || 'border-slate-200 dark:border-slate-600'} border transition-all duration-300`}>
      <h3 className={`text-xl font-bold ${colors?.textPrimary || 'text-slate-900 dark:text-slate-50'} mb-6 shrink-0`}>Recent Uploads</h3>
      <div className="space-y-3 overflow-y-auto scrollbar-hide pr-2 flex-grow min-h-0">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${colors?.primary || 'border-primary'}`}></div>
          </div>
        ) : error ? (
          <div className={`text-center py-10 border-2 border-dashed ${colors?.border || 'border-gray-300 dark:border-border-color'} rounded-lg`}>
            <AlertCircle className="mx-auto text-error mb-2" size={24} />
            <p className="text-error">{error}</p>
          </div>
        ) : recentFiles.length > 0 ? (
          recentFiles.map((res) => (
            <div
              key={res.id}
              onClick={() => handleResourceClick(res)}
              className={`flex items-center justify-between ${colors?.gradient || (isDark ? 'bg-gradient-to-br from-slate-700 to-slate-800' : 'bg-gradient-to-br from-white to-slate-50')} rounded-xl p-4 ${colors?.border || 'border-slate-200 dark:border-slate-600'} border ${colors?.shadowHover || 'hover:shadow-lg'} transition-all duration-300 hover:scale-[1.02] cursor-pointer ${colors?.gradientHover || 'hover:from-slate-600 hover:to-slate-700 dark:hover:from-slate-600 dark:hover:to-slate-700'} group`}
              title="Click to navigate to this resource in Academic Resources"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Upload Icon */}
                <div className={`${colors?.primaryBg || 'bg-blue-50 dark:bg-blue-900/30'} rounded-xl p-3 shrink-0 group-hover:${colors?.primaryBg || 'bg-blue-100 dark:bg-blue-900/40'} transition-all duration-200 ${colors?.shadow || 'shadow-sm'}`}>
                  <svg className={`w-5 h-5 ${colors?.primary || 'text-blue-600 dark:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Resource Upload Summary */}
                  <div className={`font-semibold ${colors?.textPrimary || 'text-slate-900 dark:text-slate-50'} group-hover:${colors?.primary || 'text-blue-600'} transition-colors duration-200`}>
                    A resource {res.isFolder && res.fileCount > 1 ? `(${res.fileCount} files)` : '(1 file)'} was uploaded
                  </div>

                  {/* Course and Semester Information */}
                  <div className={`text-sm ${colors?.textMuted || 'text-slate-600 dark:text-slate-400'} mt-1`}>
                    under course <span className={`font-semibold ${colors?.textSecondary || 'text-slate-700 dark:text-slate-300'}`}>{res.courseName || res.courseCode}</span> for semester <span className={`font-semibold ${colors?.textSecondary || 'text-slate-700 dark:text-slate-300'}`}>{res.semesterName || `${res.level}-${res.term}`}</span>
                  </div>

                  {/* Resource Title */}
                  <div className={`text-sm ${colors?.textSecondary || 'text-slate-600 dark:text-slate-400'} mt-1 truncate font-medium`}>
                    Title: "{res.title}"
                  </div>

                  {/* Uploader Information and Upload Date */}
                  <div className={`flex items-center gap-3 text-xs ${colors?.textSecondary || 'text-gray-500 dark:text-text-secondary'} mt-2`}>
                    <Avatar src={res.uploaderProfilePicture} name={res.uploaderName} size="xs" />
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${colors?.textSecondary || 'text-gray-700 dark:text-gray-300'}`}>
                        {res.uploaderName || 'Unknown'}
                      </span>
                      <span className={`${colors?.textMuted || 'text-gray-300 dark:text-gray-600'}`}>•</span>
                      <span>Student ID: {formatStudentId(res.uploaderStudentId) || res.uploaderStudentId || 'Unknown'}</span>
                      <span className={`${colors?.textMuted || 'text-gray-300 dark:text-gray-600'}`}>•</span>
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
          <div className={`text-center py-10 border-2 border-dashed ${colors?.border || 'border-gray-300 dark:border-border-color'} rounded-lg`}>
            <p className={`${colors?.textSecondary || 'text-gray-500 dark:text-text-secondary'}`}>No recent uploads.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentFeed;
