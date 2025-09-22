import React from 'react';
import { X, CheckCircle, FileCheck, User, Calendar, Book } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const SuccessModal = ({ isOpen, onClose, data, type = 'resource' }) => {
   const { colors, buttonClasses } = useTheme();

   if (!isOpen || !data) return null;

   const getIcon = () => {
      switch (type) {
         case 'resource':
            return <FileCheck className="h-8 w-8 text-green-500" />;
         case 'course':
            return <Book className="h-8 w-8 text-green-500" />;
         default:
            return <CheckCircle className="h-8 w-8 text-green-500" />;
      }
   };

   const getTitle = () => {
      switch (type) {
         case 'resource':
            return 'Resource Uploaded Successfully!';
         case 'course':
            return 'Course Created Successfully!';
         default:
            return 'Success!';
      }
   };

   const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
   };

   const formatResourceType = (type) => {
      return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
   };

   return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
         <div className={`${colors?.surface || 'bg-white dark:bg-gray-800'} rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 ${colors?.border || 'border-gray-200 dark:border-gray-700'} border`}>
            <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-3">
                  {getIcon()}
                  <h2 className={`text-xl font-bold ${colors?.textPrimary || 'text-gray-900 dark:text-white'}`}>{getTitle()}</h2>
               </div>
               <button
                  onClick={onClose}
                  className={`${colors?.textSecondary || 'text-gray-400'} hover:${colors?.textPrimary || 'hover:text-gray-600 dark:hover:text-gray-300'} transition-colors`}
               >
                  <X size={20} />
               </button>
            </div>

            {type === 'resource' && (
               <div className="space-y-4">
                  {/* Resource Details */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                     <div className="space-y-3">
                        <div>
                           <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Resource Title</h3>
                           <p className="text-green-700 dark:text-green-300">{data.title}</p>
                        </div>

                        {data.description && (
                           <div>
                              <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Description</h3>
                              <p className="text-green-700 dark:text-green-300">{data.description}</p>
                           </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Type</h3>
                              <p className="text-green-700 dark:text-green-300">{formatResourceType(data.resourceType)}</p>
                           </div>
                           <div>
                              <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Course</h3>
                              <p className="text-green-700 dark:text-green-300">{data.courseCode}</p>
                           </div>
                        </div>

                        {data.semesterName && (
                           <div>
                              <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Semester</h3>
                              <p className="text-green-700 dark:text-green-300">Level {data.semesterName}</p>
                           </div>
                        )}

                        {data.fileSize && (
                           <div>
                              <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">File Size</h3>
                              <p className="text-green-700 dark:text-green-300">{formatFileSize(data.fileSize)}</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Success Message */}
                  <div className="text-center py-4">
                     <p className={`${colors?.textSecondary || 'text-gray-600 dark:text-gray-400'}`}>
                        Your resource has been successfully uploaded and is now available to your classmates.
                     </p>
                  </div>
               </div>
            )}

            {type === 'course' && (
               <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                     <div className="space-y-3">
                        <div>
                           <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Course Code</h3>
                           <p className="text-green-700 dark:text-green-300">{data.code}</p>
                        </div>
                        <div>
                           <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Course Name</h3>
                           <p className="text-green-700 dark:text-green-300">{data.name}</p>
                        </div>
                     </div>
                  </div>
                  <div className="text-center py-4">
                     <p className={`${colors?.textSecondary || 'text-gray-600 dark:text-gray-400'}`}>
                        Course has been added successfully to your curriculum.
                     </p>
                  </div>
               </div>
            )}

            <div className="flex justify-center mt-6">
               <button
                  onClick={onClose}
                  className={`${buttonClasses?.success || 'px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white'} font-semibold transition-all flex items-center gap-2`}
               >
                  <CheckCircle size={16} />
                  Great!
               </button>
            </div>
         </div>
      </div>
   );
};

export default SuccessModal;