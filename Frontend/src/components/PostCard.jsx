import React from 'react';
import { MessageCircle, ThumbsUp, Clock, User } from 'lucide-react';

const PostCard = ({ post }) => {
  const { title, content, author, timestamp, likes, comments, category } = post;

  const getCategoryColor = (category) => {
    const colors = {
      'help': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'resource': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'question': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'announcement': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{author}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{timestamp}</span>
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
          {category}
        </span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">{content}</p>

      <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400">
        <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors duration-200">
          <ThumbsUp className="h-4 w-4" />
          <span className="text-sm">{likes}</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors duration-200">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">{comments}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;