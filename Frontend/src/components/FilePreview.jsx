import React, { useState, useEffect } from 'react';
import { AlertCircle, Download, ExternalLink, FileText } from 'lucide-react';

const FilePreview = ({ fileUrl, fileType, fileName }) => {
   const [error, setError] = useState(false);
   const [loading, setLoading] = useState(true);

   // Get file extension from fileType or fileName
   const getFileExtension = () => {
      if (fileType) return fileType.toLowerCase();
      if (fileName) return fileName.split('.').pop()?.toLowerCase() || '';
      if (fileUrl) return fileUrl.split('.').pop()?.toLowerCase() || '';
      return '';
   };

   const extension = getFileExtension();

   // Reset error state when fileUrl changes
   useEffect(() => {
      setError(false);
      setLoading(true);
   }, [fileUrl]);

   const handleLoad = () => {
      setLoading(false);
   };

   const handleError = () => {
      setError(true);
      setLoading(false);
   };

   // Image file types
   const isImage = (ext) => {
      return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext);
   };

   // Video file types
   const isVideo = (ext) => {
      return ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext);
   };

   // Audio file types
   const isAudio = (ext) => {
      return ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(ext);
   };

   // PDF file type
   const isPdf = (ext) => {
      return ext === 'pdf';
   };

   // Office document types that work well with Google Docs Viewer
   const isOfficeDocument = (ext) => {
      return ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(ext);
   };

   // Text file types
   const isTextFile = (ext) => {
      return ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js', 'md'].includes(ext);
   };

   // Google Docs Viewer URL
   const getGoogleDocsUrl = (url) => {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
   };

   // Get the best viewing URL for external links
   const getExternalViewUrl = (url, ext) => {
      // For office documents, try multiple approaches
      if (isOfficeDocument(ext) || ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'].includes(ext)) {
         // Try Microsoft Office Online viewer first (often more reliable)
         return getMicrosoftOfficeUrl(url);
      }

      // For PDFs, try to force inline viewing with multiple parameters
      if (isPdf(ext)) {
         const separator = url.includes('?') ? '&' : '?';
         // Add multiple parameters to force viewing
         return `${url}${separator}view=inline&download=0&embedded=true#view=FitH&toolbar=0&navpanes=0`;
      }

      // For other files, try to open with a blob URL approach or add view parameters
      if (url.startsWith('http')) {
         const separator = url.includes('?') ? '&' : '?';
         return `${url}${separator}view=inline&download=0`;
      }

      // For other files, return original URL
      return url;
   };

   // Microsoft Office Online Viewer URL (alternative)
   const getMicrosoftOfficeUrl = (url) => {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
   };

   // Get MIME type for file extension
   const getMimeType = (ext) => {
      const mimeTypes = {
         'pdf': 'application/pdf',
         'doc': 'application/msword',
         'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'xls': 'application/vnd.ms-excel',
         'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'ppt': 'application/vnd.ms-powerpoint',
         'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
         'jpg': 'image/jpeg',
         'jpeg': 'image/jpeg',
         'png': 'image/png',
         'gif': 'image/gif',
         'txt': 'text/plain',
         'html': 'text/html',
         'css': 'text/css',
         'js': 'application/javascript',
         'json': 'application/json'
      };
      return mimeTypes[ext] || 'application/octet-stream';
   }; const renderPreview = () => {
      if (!fileUrl) {
         return (
            <div className="flex items-center justify-center h-64">
               <div className="text-center">
                  <FileText size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No file URL provided</p>
               </div>
            </div>
         );
      }

      // Image preview
      if (isImage(extension)) {
         return (
            <div className="flex items-center justify-center h-full min-h-64">
               <img
                  src={fileUrl}
                  alt={fileName || 'Image preview'}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onLoad={handleLoad}
                  onError={handleError}
                  style={{ display: loading ? 'none' : 'block' }}
               />
               {loading && (
                  <div className="flex items-center justify-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
               )}
               {error && (
                  <div className="text-center">
                     <AlertCircle size={48} className="mx-auto text-red-400 mb-2" />
                     <p className="text-red-500">Failed to load image</p>
                  </div>
               )}
            </div>
         );
      }

      // Video preview
      if (isVideo(extension)) {
         return (
            <div className="flex items-center justify-center h-full min-h-64">
               <video
                  controls
                  className="max-w-full max-h-full rounded-lg"
                  onLoadedData={handleLoad}
                  onError={handleError}
                  style={{ display: loading ? 'none' : 'block' }}
               >
                  <source src={fileUrl} type={`video/${extension}`} />
                  Your browser does not support the video tag.
               </video>
               {loading && (
                  <div className="flex items-center justify-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
               )}
               {error && (
                  <div className="text-center">
                     <AlertCircle size={48} className="mx-auto text-red-400 mb-2" />
                     <p className="text-red-500">Failed to load video</p>
                  </div>
               )}
            </div>
         );
      }

      // Audio preview
      if (isAudio(extension)) {
         return (
            <div className="flex items-center justify-center h-full min-h-64">
               <div className="text-center">
                  <div className="mb-4">
                     <FileText size={64} className="mx-auto text-primary mb-2" />
                     <p className="text-lg font-medium">{fileName || 'Audio File'}</p>
                     <p className="text-gray-500 uppercase">{extension} file</p>
                  </div>
                  <audio
                     controls
                     className="w-full max-w-md"
                     onLoadedData={handleLoad}
                     onError={handleError}
                  >
                     <source src={fileUrl} type={`audio/${extension}`} />
                     Your browser does not support the audio tag.
                  </audio>
                  {error && (
                     <div className="mt-4">
                        <p className="text-red-500">Failed to load audio</p>
                     </div>
                  )}
               </div>
            </div>
         );
      }

      // PDF preview
      if (isPdf(extension)) {
         return (
            <div className="h-full min-h-96">
               {!error ? (
                  <iframe
                     src={fileUrl}
                     className="w-full h-full border-0 rounded-lg"
                     title={fileName || 'PDF preview'}
                     onLoad={handleLoad}
                     onError={handleError}
                     style={{ display: loading ? 'none' : 'block' }}
                  />
               ) : (
                  <iframe
                     src={getGoogleDocsUrl(fileUrl)}
                     className="w-full h-full border-0 rounded-lg"
                     title={fileName || 'PDF preview via Google Docs'}
                     onLoad={handleLoad}
                  />
               )}
               {loading && (
                  <div className="flex items-center justify-center h-full">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
               )}
            </div>
         );
      }

      // Office documents (Word, Excel, PowerPoint)
      if (isOfficeDocument(extension)) {
         return (
            <div className="h-full min-h-96">
               {!error ? (
                  <iframe
                     src={getGoogleDocsUrl(fileUrl)}
                     className="w-full h-full border-0 rounded-lg"
                     title={fileName || 'Document preview'}
                     onLoad={handleLoad}
                     onError={handleError}
                     style={{ display: loading ? 'none' : 'block' }}
                  />
               ) : (
                  <iframe
                     src={getMicrosoftOfficeUrl(fileUrl)}
                     className="w-full h-full border-0 rounded-lg"
                     title={fileName || 'Document preview via Microsoft Office Online'}
                     onLoad={handleLoad}
                  />
               )}
               {loading && (
                  <div className="flex items-center justify-center h-full">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
               )}
               {error && (
                  <div className="flex items-center justify-center h-full">
                     <div className="text-center">
                        <AlertCircle size={48} className="mx-auto text-red-400 mb-2" />
                        <p className="text-red-500 mb-4">Unable to preview this document</p>
                        <div className="space-y-2">
                           <a
                              href={fileUrl}
                              download={fileName}
                              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                           >
                              <Download size={16} />
                              Download file
                           </a>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         );
      }

      // Text files and CSV
      if (isTextFile(extension)) {
         return (
            <div className="h-full min-h-96">
               <iframe
                  src={fileUrl}
                  className="w-full h-full border-0 rounded-lg bg-white"
                  title={fileName || 'Text file preview'}
                  onLoad={handleLoad}
                  onError={handleError}
                  style={{ display: loading ? 'none' : 'block' }}
               />
               {loading && (
                  <div className="flex items-center justify-center h-full">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
               )}
               {error && (
                  <div className="flex items-center justify-center h-full">
                     <div className="text-center">
                        <AlertCircle size={48} className="mx-auto text-red-400 mb-2" />
                        <p className="text-red-500">Failed to load text file</p>
                     </div>
                  </div>
               )}
            </div>
         );
      }

      // Fallback for unsupported file types
      return (
         <div className="flex items-center justify-center h-full min-h-64">
            <div className="text-center">
               <FileText size={64} className="mx-auto text-gray-400 mb-4" />
               <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Preview not available
               </h3>
               <p className="text-gray-500 mb-4">
                  This file type ({extension.toUpperCase()}) cannot be previewed directly.
               </p>
               <div className="space-y-2">
                  <a
                     href={fileUrl}
                     download={fileName}
                     className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                     <Download size={16} />
                     Download file
                  </a>
               </div>
            </div>
         </div>
      );
   };

   return (
      <div className="w-full h-full">
         {renderPreview()}
      </div>
   );
};

export default FilePreview;