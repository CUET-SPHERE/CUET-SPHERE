import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, MessageCircle, Paperclip } from 'lucide-react';

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString();
}

function PostCard({ post }) {
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [bookmarked, setBookmarked] = useState(post.bookmarked);
  const [userVote, setUserVote] = useState(null); // 'up' | 'down' | null

  const handleUpvote = () => {
    if (userVote === 'up') {
      setUpvotes(upvotes - 1);
      setUserVote(null);
    } else {
      setUpvotes(upvotes + 1);
      if (userVote === 'down') setDownvotes(downvotes - 1);
      setUserVote('up');
    }
  };

  const handleDownvote = () => {
    if (userVote === 'down') {
      setDownvotes(downvotes - 1);
      setUserVote(null);
    } else {
      setDownvotes(downvotes + 1);
      if (userVote === 'up') setUpvotes(upvotes - 1);
      setUserVote('down');
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  return (
    <div className="bg-gray-50 rounded-lg shadow p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{post.author}</span>
          <span className="text-xs text-gray-500">{formatDate(post.timestamp)}</span>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{post.category}</span>
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{post.title}</h3>
        <p className="text-gray-700 mb-2">{post.content}</p>
        {post.attachment && (
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <Paperclip className="h-4 w-4" />
            <a href="#" className="underline">{post.attachment}</a>
          </div>
        )}
      </div>
      <div className="flex items-center gap-6 mt-2 text-gray-600">
        <button className={`flex items-center gap-1 hover:text-blue-600 ${userVote === 'up' ? 'text-blue-600' : ''}`} onClick={handleUpvote}>
          <ThumbsUp className="h-4 w-4" />
          <span className="text-sm">{upvotes}</span>
        </button>
        <button className={`flex items-center gap-1 hover:text-red-600 ${userVote === 'down' ? 'text-red-600' : ''}`} onClick={handleDownvote}>
          <ThumbsDown className="h-4 w-4" />
          <span className="text-sm">{downvotes}</span>
        </button>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">{post.commentsCount}</span>
        </div>
        <button className="ml-auto" onClick={handleBookmark}>
          {bookmarked ? (
            <BookmarkCheck className="h-5 w-5 text-blue-600" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

export default PostCard;