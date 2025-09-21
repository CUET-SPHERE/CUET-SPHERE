import React, { useState } from 'react';
import { useResources } from '../contexts/ResourcesContext';
import FileIcon from './FileIcon';
import FileTypeIcon from './FileTypeIcon';
import FileViewer from './FileViewer';
import { Download, Eye, AlertCircle } from 'lucide-react';
import { formatTimeAgo } from '../utils/time';
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

// Function to format student ID as batch+dept+id (e.g., 21CSE012)
const formatStudentId = (studentId) => {
  if (!studentId || typeof studentId !== 'string' || studentId.length < 4) return null;

  const batch = studentId.substring(0, 2);
  const deptCode = studentId.substring(2, 4);
  const id = studentId.substring(4);
  const deptShort = departmentMap[deptCode] || deptCode;

  // Ensure ID part is at least 3 digits with leading zeros
  const formattedId = id.padStart(3, '0');

  return `${batch}${deptShort}${formattedId}`;
};

function RecentFeed() {
  const { resources, loading, error } = useResources();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Get top 7 most recent resources
  const recentFiles = resources.length > 0 ?
    [...resources]
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, 7)
    : [];

  // Handle view file function (same as AcademicResources)
  const handleViewFile = (resource) => {
    setSelectedFile({
      url: resource.fileUrl || resource.file?.url || resource.filePath,
      name: resource.title,
      type: resource.file?.type || resource.fileType || 'application/octet-stream'
    });
    setViewerOpen(true);
  };

  return (
    <div className="bg-white dark:bg-surface rounded-2xl shadow-2xl p-4 flex flex-col h-full border border-gray-200 dark:border-border-color">
      <h3 className="text-lg font-bold text-gray-800 dark:text-text-primary mb-4 shrink-0">Recent Uploads</h3>
      <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
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
            <div key={res.id} className="flex items-center justify-between bg-gray-100 dark:bg-background rounded-lg p-4 border border-gray-200 dark:border-border-color hover:shadow-md transition-all hover:border-primary">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* File Type Icon */}
                <FileTypeIcon
                  filename={res.file?.name || res.fileName || res.fileUrl?.split('/').pop() || res.filePath?.split('/').pop() || res.title}
                  size={28}
                />

                <div className="flex-1 min-w-0">
                  {/* Resource Title and Link */}
                  <button
                    onClick={() => handleViewFile(res)}
                    className="resource-title-button font-semibold text-gray-800 dark:text-text-primary hover:text-primary transition-colors block truncate text-left w-full cursor-pointer"
                  >
                    {res.title}
                  </button>

                  {/* Resource Description (if available) */}
                  {res.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {res.description}
                    </p>
                  )}

                  {/* Uploader Information and Upload Date */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-text-secondary mt-2">
                    <Avatar src={res.uploaderProfilePicture} name={res.uploaderName} size="xs" />
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {res.uploaderName || 'Unknown'}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span>Student ID: {res.uploaderStudentId || 'Unknown'}</span>
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

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleViewFile(res)}
                  className="p-2 rounded-md text-gray-500 dark:text-text-secondary hover:bg-primary/20 hover:text-primary transition-colors"
                  title={`View ${res.title}`}
                >
                  <Eye size={16} />
                </button>
                <a
                  href={res.fileUrl || res.file?.url || res.filePath}
                  download={res.file?.name || res.fileName || res.title}
                  className="p-2 rounded-md text-gray-500 dark:text-text-secondary hover:bg-primary/20 hover:text-primary transition-colors"
                  title={`Download ${res.title}`}
                >
                  <Download size={16} />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-border-color rounded-lg">
            <p className="text-gray-500 dark:text-text-secondary">No recent uploads.</p>
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      {viewerOpen && selectedFile && (
        <FileViewer
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          file={selectedFile}
        />
      )}
    </div>
  );
}

export default RecentFeed;
