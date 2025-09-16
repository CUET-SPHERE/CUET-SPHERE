import React from 'react';

const PostSkeleton = () => {
   return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
         <div className="p-6">
            {/* Post Header Skeleton */}
            <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                  {/* Avatar Skeleton */}
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="space-y-2">
                     {/* Author Name Skeleton */}
                     <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                     {/* Timestamp Skeleton */}
                     <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  </div>
               </div>
            </div>

            {/* Post Title Skeleton */}
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>

            {/* Post Content Skeleton */}
            <div className="space-y-2 mb-4">
               <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
               <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
               <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6"></div>
            </div>

            {/* Tags Skeleton */}
            <div className="flex gap-2 mb-4">
               <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
               <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-20"></div>
               <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-14"></div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-6">
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default PostSkeleton;