import React from 'react';
import { useResources } from '../contexts/ResourcesContext';
import FileIcon from './FileIcon';
import { Download, Eye } from 'lucide-react';
import { formatTimeAgo } from '../utils/time';

function RecentFeed() {
  const { resources } = useResources();

  // Get top 7 most recent resources
  const recentFiles = [...resources]
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .slice(0, 7);

  return (
    <div className="bg-white dark:bg-surface rounded-2xl shadow-2xl p-4 flex flex-col h-full border border-gray-200 dark:border-border-color">
      <h3 className="text-lg font-bold text-gray-800 dark:text-text-primary mb-4 shrink-0">Recent Uploads</h3>
      <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
        {recentFiles.length > 0 ? (
          recentFiles.map((res) => (
            <div key={res.id} className="group bg-gray-50 dark:bg-background rounded-lg p-3 border border-gray-200 dark:border-border-color flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileIcon fileType={res.file.type} className="h-6 w-6 shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-medium text-sm text-gray-800 dark:text-text-primary truncate">{res.title}</p>
                  <p className="text-xs text-gray-500 dark:text-text-secondary truncate">
                    {res.uploader.split('@')[0]} &middot; {formatTimeAgo(new Date(res.uploadedAt))}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={res.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md text-gray-500 dark:text-text-secondary hover:bg-primary/20 hover:text-primary transition-colors"
                  aria-label={`View ${res.title}`}
                >
                  <Eye size={16} />
                </a>
                <a
                  href={res.file.url}
                  download={res.file.name}
                  className="p-2 rounded-md text-gray-500 dark:text-text-secondary hover:bg-primary/20 hover:text-primary transition-colors"
                  aria-label={`Download ${res.title}`}
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
    </div>
  );
}

export default RecentFeed;
