import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, MessageCircle, Paperclip, Send, ImageIcon } from 'lucide-react';
import { formatTimeAgo, getInitials, getAvatarColor, isImageUrl } from '../utils/formatters';

// Avatar component
function Avatar({ src, name, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  if (src) {
    return (
      <img 
        src={src} 
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200`}
      />
    );
  }

  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  return (
    <div className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-medium`}>
      {initials}
    </div>
  );
}

// Comment component with reply, edit, delete functionality
function Comment({ comment, onReply, onEdit, onDelete, currentUserId, depth = 0 }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const isOwner = comment.authorEmail === 'rony@student.cuet.ac.bd'; // Mock current user check
  const maxDepth = 3; // Maximum nesting level

  const handleEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (action === 'edit') handleEdit();
      if (action === 'reply') handleReply();
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-600 pl-4' : ''}`}>
      <div className="flex gap-3 py-3">
        <Avatar src={comment.profilePicture} name={comment.author} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 dark:text-white text-sm">{comment.author}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">ID: {comment.studentId}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(comment.timestamp)}</span>
            {comment.isEdited && (
              <>
                <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 italic">edited</span>
              </>
            )}
          </div>
          
          {/* Comment Content */}
          {isEditing ? (
            <div className="mb-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'edit')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                rows="2"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{comment.content}</p>
          )}

          {/* Comment Actions */}
          {!isEditing && (
            <div className="flex items-center gap-4 text-xs">
              {depth < maxDepth && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  Reply
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium"
                  >
                    Delete
                  </button>
                </>
              )}
              {comment.replies && comment.replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>
          )}

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3 flex gap-2">
              <Avatar src={null} name="Muhammad Rony" size="sm" />
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'reply')}
                  placeholder={`Reply to ${comment.author}...`}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                  rows="2"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleReply}
                    disabled={!replyContent.trim()}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent('');
                    }}
                    className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && showReplies && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Enhanced Image component with error handling
function PostImage({ src, alt }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!src || imageError) {
    return null;
  }

  return (
    <div className="mt-3 mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
      {imageLoading && (
        <div className="flex items-center justify-center h-64 bg-gray-200 dark:bg-gray-700">
          <div className="animate-pulse flex items-center gap-2 text-gray-500">
            <ImageIcon className="h-6 w-6" />
            <span>Loading image...</span>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full max-h-96 object-contain ${imageLoading ? 'hidden' : 'block'}`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
    </div>
  );
}

function PostCard({ post }) {
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [bookmarked, setBookmarked] = useState(post.bookmarked);
  const [userVote, setUserVote] = useState(null); // 'up' | 'down' | null
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');

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

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        author: 'Muhammad Rony', // This would come from current user context
        authorEmail: 'rony@student.cuet.ac.bd',
        studentId: '2204005',
        profilePicture: null,
        content: newComment.trim(),
        timestamp: new Date().toISOString()
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // Comment management functions
  const handleReplyToComment = (parentCommentId, replyContent) => {
    const newReply = {
      id: Date.now(), // Simple ID generation
      author: 'Muhammad Rony',
      authorEmail: 'rony@student.cuet.ac.bd',
      studentId: '2204005',
      profilePicture: null,
      content: replyContent,
      timestamp: new Date().toISOString(),
      isEdited: false,
      replies: []
    };

    const updateCommentsWithReply = (comments) => {
      return comments.map(comment => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentsWithReply(comment.replies)
          };
        }
        return comment;
      });
    };

    setComments(updateCommentsWithReply(comments));
  };

  const handleEditComment = (commentId, newContent) => {
    const updateCommentsWithEdit = (comments) => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            content: newContent,
            isEdited: true
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentsWithEdit(comment.replies)
          };
        }
        return comment;
      });
    };

    setComments(updateCommentsWithEdit(comments));
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      const deleteCommentFromTree = (comments) => {
        return comments.filter(comment => {
          if (comment.id === commentId) {
            return false;
          }
          if (comment.replies && comment.replies.length > 0) {
            comment.replies = deleteCommentFromTree(comment.replies);
          }
          return true;
        });
      };

      setComments(deleteCommentFromTree(comments));
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Help': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Resource': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Question': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Announcement': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[category] || 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar src={post.profilePicture} name={post.author} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">{post.author}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatTimeAgo(post.timestamp)}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Student ID: {post.studentId}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
            {post.category}
          </span>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{post.content}</p>
          
          {/* Image Display */}
          {post.image && isImageUrl(post.image) && (
            <PostImage src={post.image} alt={post.title} />
          )}

          {/* Attachment */}
          {post.attachment && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Paperclip className="h-4 w-4 text-gray-500" />
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                {post.attachment}
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-6">
            <button 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                userVote === 'up' 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`} 
              onClick={handleUpvote}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="text-sm font-medium">{upvotes}</span>
            </button>
            
            <button 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                userVote === 'down' 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`} 
              onClick={handleDownvote}
            >
              <ThumbsDown className="h-4 w-4" />
              <span className="text-sm font-medium">{downvotes}</span>
            </button>
            
            <button 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{comments.length}</span>
            </button>
          </div>
          
          <button 
            className={`p-2 rounded-lg transition-colors ${
              bookmarked 
                ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={handleBookmark}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 p-6">
          {/* Add Comment */}
          <div className="flex gap-3 mb-4">
            <Avatar src={null} name="Muhammad Rony" size="sm" />
            <div className="flex-1">
              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="2"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-1">
            {comments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <Comment 
                  key={comment.id} 
                  comment={comment}
                  onReply={handleReplyToComment}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  currentUserId="2204005"
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;
