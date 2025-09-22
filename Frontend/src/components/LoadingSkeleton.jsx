import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Skeleton for individual post cards
function PostSkeleton() {
  const { colors } = useTheme();

  return (
    <div className={`${colors?.cardBackground || 'bg-white dark:bg-gray-800'} rounded-xl shadow-sm ${colors?.border || 'border-gray-200 dark:border-gray-700'} border overflow-hidden`}>
      <div className="p-6">
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded-full animate-pulse`}></div>
            <div>
              <div className={`h-4 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded w-32 mb-2 animate-pulse`}></div>
              <div className={`h-3 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded w-24 animate-pulse`}></div>
            </div>
          </div>
          <div className={`h-6 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded-full w-16 animate-pulse`}></div>
        </div>

        {/* Content skeleton */}
        <div className="mb-4">
          <div className={`h-5 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded w-3/4 mb-2 animate-pulse`}></div>
          <div className="space-y-2">
            <div className={`h-4 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded w-full animate-pulse`}></div>
            <div className={`h-4 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded w-5/6 animate-pulse`}></div>
            <div className={`h-4 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded w-4/6 animate-pulse`}></div>
          </div>
        </div>

        {/* Actions skeleton */}
        <div className={`flex items-center justify-between pt-3 border-t ${colors?.borderLight || 'border-gray-100 dark:border-gray-700'}`}>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`h-4 w-4 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded animate-pulse`}></div>
              <div className={`h-4 w-6 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded animate-pulse`}></div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-4 w-4 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded animate-pulse`}></div>
              <div className={`h-4 w-6 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded animate-pulse`}></div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-4 w-4 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded animate-pulse`}></div>
              <div className={`h-4 w-6 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded animate-pulse`}></div>
            </div>
          </div>
          <div className={`h-5 w-5 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded animate-pulse`}></div>
        </div>
      </div>
    </div>
  );
}

// Multiple post skeletons
function PostListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }, (_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}

// Comment skeleton
function CommentSkeleton() {
  const { colors } = useTheme();

  return (
    <div className="flex gap-3 py-3">
      <div className={`w-8 h-8 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded-full animate-pulse`}></div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className={`h-3 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded w-20 animate-pulse`}></div>
          <div className={`h-3 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded w-16 animate-pulse`}></div>
          <div className={`h-3 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded w-12 animate-pulse`}></div>
        </div>
        <div className="space-y-1">
          <div className={`h-3 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded w-full animate-pulse`}></div>
          <div className={`h-3 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded w-3/4 animate-pulse`}></div>
        </div>
      </div>
    </div>
  );
}

// Multiple comment skeletons
function CommentListSkeleton({ count = 2 }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }, (_, index) => (
        <CommentSkeleton key={index} />
      ))}
    </div>
  );
}

export { PostSkeleton, PostListSkeleton, CommentSkeleton, CommentListSkeleton };

// Default export for general loading skeleton
const LoadingSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div className="animate-pulse">
      <div className={`h-4 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded w-3/4 mb-2`}></div>
      <div className={`h-4 ${colors?.skeletonBase || 'bg-gray-200 dark:bg-gray-700'} rounded w-1/2`}></div>
    </div>
  );
};

export default LoadingSkeleton;
