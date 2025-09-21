import React from 'react';
import {
   FileText,
   Image,
   Video,
   Music,
   Archive,
   File,
   FileSpreadsheet,
   Presentation,
   FileCode,
   Book
} from 'lucide-react';

const FileTypeIcon = ({ filename, size = 20, className = "" }) => {
   const getFileExtension = (filename) => {
      if (!filename) return '';
      return filename.split('.').pop()?.toLowerCase() || '';
   };

   const getIconAndColor = (extension) => {
      switch (extension) {
         // Documents
         case 'pdf':
            return { icon: FileText, color: 'text-red-500 bg-red-100 dark:bg-red-900/30' };
         case 'doc':
         case 'docx':
            return { icon: FileText, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' };
         case 'txt':
            return { icon: FileText, color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30' };

         // Presentations
         case 'ppt':
         case 'pptx':
            return { icon: Presentation, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' };

         // Spreadsheets
         case 'xls':
         case 'xlsx':
            return { icon: FileSpreadsheet, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' };

         // Images
         case 'jpg':
         case 'jpeg':
         case 'png':
         case 'gif':
         case 'bmp':
         case 'svg':
         case 'webp':
            return { icon: Image, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' };

         // Videos
         case 'mp4':
         case 'avi':
         case 'mov':
         case 'wmv':
         case 'flv':
         case 'webm':
         case 'mkv':
            return { icon: Video, color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30' };

         // Audio
         case 'mp3':
         case 'wav':
         case 'flac':
         case 'aac':
         case 'ogg':
            return { icon: Music, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' };

         // Archives
         case 'zip':
         case 'rar':
         case '7z':
         case 'tar':
         case 'gz':
            return { icon: Archive, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' };

         // Code files
         case 'html':
         case 'css':
         case 'js':
         case 'jsx':
         case 'ts':
         case 'tsx':
         case 'py':
         case 'java':
         case 'cpp':
         case 'c':
         case 'php':
         case 'sql':
            return { icon: FileCode, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' };

         // Books/E-books
         case 'epub':
         case 'mobi':
            return { icon: Book, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' };

         default:
            return { icon: File, color: 'text-gray-500 bg-gray-100 dark:bg-gray-900/30' };
      }
   };

   const extension = getFileExtension(filename);
   const { icon: Icon, color } = getIconAndColor(extension);

   return (
      <div className={`inline-flex items-center justify-center rounded-lg p-2 ${color} ${className}`}>
         <Icon size={size} />
      </div>
   );
};

// Component for display in file lists
export const FileTypeIconWithName = ({ filename, size = 16, showExtension = true }) => {
   const getFileExtension = (filename) => {
      if (!filename) return '';
      return filename.split('.').pop()?.toLowerCase() || '';
   };

   const getBaseName = (filename) => {
      if (!filename) return '';
      const parts = filename.split('.');
      return parts.length > 1 ? parts.slice(0, -1).join('.') : filename;
   };

   const extension = getFileExtension(filename);
   const baseName = getBaseName(filename);

   return (
      <div className="flex items-center gap-2">
         <FileTypeIcon filename={filename} size={size} />
         <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
               {baseName}
            </p>
            {showExtension && extension && (
               <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                  {extension}
               </p>
            )}
         </div>
      </div>
   );
};

export default FileTypeIcon;