import React from 'react';
import { useResources } from '../contexts/ResourcesContext';
import FileIcon from './FileIcon';
import { Download, Eye, Star, AlertCircle } from 'lucide-react';
import { formatTimeAgo } from '../utils/time';

function RecentFeed() {
  const { resources, toggleFavourite, findFolder, loading, error } = useResources();

  const favouritesFolder = findFolder('favourites');
  const favouriteResourceIds = favouritesFolder ? favouritesFolder.resourceIds : [];

  // Get top 7 most recent resources
  const recentFiles = resources.length > 0 ?
    [...resources]
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, 7)
    : [];

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
            <div key={res.id} className="group bg-gray-50 dark:bg-background rounded-lg p-3 border border-gray-200 dark:border-border-color flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileIcon fileType={res.file.type} className="h-6 w-6 shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-medium text-sm text-gray-800 dark:text-text-primary truncate">{res.title}</p>
                  <div className="text-xs text-gray-500 dark:text-text-secondary">
                    <p className="truncate">uploaded by: {res.uploader}</p>
                    <p className="truncate">Id: 22{Math.floor(Math.random() * 10000).toString().padStart(4, '0')} &middot; {formatTimeAgo(new Date(res.uploadedAt))}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleFavourite(res.id)}
                  className="p-2 rounded-md text-gray-500 dark:text-text-secondary hover:bg-yellow-100 dark:hover:bg-yellow-900 hover:text-yellow-500 transition-colors"
                  aria-label={`Favorite ${res.title}`}
                >
                  <Star size={16} className={favouriteResourceIds.includes(res.id) ? 'text-yellow-500 fill-current' : ''} />
                </button>
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
