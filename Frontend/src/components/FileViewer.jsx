import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import FilePreview from './FilePreview';

const FileViewer = ({ isOpen, onClose, fileUrl, fileName, fileType }) => {
   if (!isOpen) return null;

   const getFileExtension = (filename) => {
      return filename?.split('.').pop()?.toLowerCase() || '';
   };

   const extension = getFileExtension(fileName);

   const handleDownload = () => {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   const handleOpenExternal = () => {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
   };

   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
         <div className="bg-white dark:bg-gray-800 rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
               <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                     {fileName || 'File Viewer'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                     {extension.toUpperCase()} File
                  </p>
               </div>

               <div className="flex items-center gap-2 ml-4">
                  <button
                     onClick={handleDownload}
                     className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                     title="Download file"
                  >
                     <Download size={18} />
                  </button>

                  <button
                     onClick={handleOpenExternal}
                     className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                     title="Open in new tab"
                  >
                     <ExternalLink size={18} />
                  </button>

                  <button
                     onClick={onClose}
                     className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                     title="Close viewer"
                  >
                     <X size={18} />
                  </button>
               </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
               <FilePreview
                  fileUrl={fileUrl}
                  fileType={extension}
                  fileName={fileName}
               />
            </div>
         </div>
      </div>
   );
};

export default FileViewer;