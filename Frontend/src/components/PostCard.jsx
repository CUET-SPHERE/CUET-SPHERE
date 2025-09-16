import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, MessageCircle, Paperclip, Send, ImageIcon, Trash2 } from 'lucide-react';
import { formatTimeAgo, getInitials, getAvatarColor, isImageUrl } from '../utils/formatters';
import commentService from '../services/commentService';
import replyService from '../services/replyService';
import voteService from '../services/voteService';

// Avatar component
const Avatar = React.memo(({ src, name, size = 'md' }) => {
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
});

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

const PostImage = React.memo(({ src, alt }) => {
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
        loading="lazy"
        className={`w-full max-h-96 object-contain ${imageLoading ? 'hidden' : 'block'}`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
    </div>
  );
});

const PostCard = React.memo(React.forwardRef(({ post, isManageMode = false, onDelete, onSelectTag }, ref) => {
  const [upvotes, setUpvotes] = useState(post.upvotes || 0);
  const [downvotes, setDownvotes] = useState(post.downvotes || 0);
  const [bookmarked, setBookmarked] = useState(post.bookmarked || false);
  const [userVote, setUserVote] = useState(null); // 'up' | 'down' | null
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showFullContent, setShowFullContent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const MAX_CONTENT_LENGTH = 200; // Adjust as needed

  const displayedContent = post.content.length > MAX_CONTENT_LENGTH && !showFullContent
    ? `${post.content.substring(0, MAX_CONTENT_LENGTH)}...`
    : post.content;

  const toggleShowFullContent = () => {
    setShowFullContent(!showFullContent);
  };

  // Load comments initially when component mounts - REMOVED FOR LAZY LOADING
  useEffect(() => {
    // If post already has comments from the backend, use them
    if (post.comments && post.comments.length > 0) {
      setComments(post.comments);
      setCommentsLoaded(true);
    }
    // Don't load comments from API immediately - wait for user to request them
  }, [post.id]);

  // Load comments when showComments is toggled and not already loaded
  useEffect(() => {
    if (showComments && !commentsLoaded) {
      loadComments();
    }
  }, [showComments, commentsLoaded]);

  // Load votes when component mounts
  useEffect(() => {
    loadVotes();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedComments = await commentService.getCommentsForPost(post.id);

      // The backend now returns CommentDTOs with proper user information and nested replies
      const processedComments = (fetchedComments || []).map(comment => ({
        ...comment,
        // Ensure replies are properly structured
        replies: comment.replies || []
      }));

      setComments(processedComments);
      setCommentsLoaded(true);
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadVotes = async () => {
    try {
      // Get current user ID from localStorage
      const getCurrentUserId = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            return parsedUser.id || 1;
          } catch (e) {
            console.error('Error parsing user data for ID:', e);
          }
        }
        return 1;
      };

      const currentUserId = getCurrentUserId();

      // Load all votes for the post to get counts
      const votes = await voteService.getVotesForPost(post.id);
      const upvoteCount = votes.filter(vote => vote.voteType === 'UPVOTE').length;
      const downvoteCount = votes.filter(vote => vote.voteType === 'DOWNVOTE').length;
      setUpvotes(upvoteCount);
      setDownvotes(downvoteCount);

      // Load current user's vote separately for better performance
      try {
        const userVoteObj = await voteService.getUserVoteForPost(post.id, currentUserId);
        if (userVoteObj) {
          setUserVote(userVoteObj.voteType === 'UPVOTE' ? 'up' : 'down');
        }
      } catch (userVoteErr) {
        // User hasn't voted, which is fine
      }
    } catch (err) {
      // Silently fail for votes - not critical
    }
  };

  const handleUpvote = async () => {
    try {
      const result = await voteService.upvote(post.id); // Will use current user ID

      if (result.removed) {
        // Vote was removed
        setUpvotes(upvotes - 1);
        setUserVote(null);
      } else {
        // Vote was created or updated
        setUpvotes(upvotes + 1);
        if (userVote === 'down') setDownvotes(downvotes - 1);
        setUserVote('up');
      }
    } catch (err) {
      setError('Failed to vote');
    }
  };

  const handleDownvote = async () => {
    try {
      const result = await voteService.downvote(post.id); // Will use current user ID

      if (result.removed) {
        // Vote was removed
        setDownvotes(downvotes - 1);
        setUserVote(null);
      } else {
        // Vote was created or updated
        setDownvotes(downvotes + 1);
        if (userVote === 'up') setUpvotes(upvotes - 1);
        setUserVote('down');
      }
    } catch (err) {
      setError('Failed to vote');
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        setLoading(true);
        const getCurrentUserId = () => {
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              return parsedUser.id || 1;
            } catch (e) {
              console.error('Error parsing user data for ID:', e);
            }
          }
          return 1;
        };

        const commentData = {
          text: newComment.trim(),
          userId: getCurrentUserId()
        };

        const createdComment = await commentService.createComment(post.id, commentData);

        // Add the new comment to the list
        // The backend now returns a CommentDTO with all user information
        const newCommentObj = {
          ...createdComment,
          // The DTO should already have author, authorEmail, studentId, etc.
          // But ensure replies array exists
          replies: createdComment.replies || []
        };

        setComments([...comments, newCommentObj]);
        setNewComment('');
      } catch (err) {
        setError('Failed to add comment');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // Comment management functions
  const handleReplyToComment = async (parentCommentId, replyContent) => {
    try {
      setLoading(true);
      const getCurrentUserId = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            return parsedUser.id || 1;
          } catch (e) {
            console.error('Error parsing user data for ID:', e);
          }
        }
        return 1;
      };

      const replyData = {
        text: replyContent,
        userId: getCurrentUserId()
      };

      const createdReply = await replyService.createReply(parentCommentId, replyData);

      // The backend now returns a ReplyDTO with all user information
      const newReply = {
        ...createdReply,
        // The DTO should already have author, authorEmail, studentId, etc.
        isEdited: false,
        replies: [] // Replies don't have nested replies in this implementation
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
    } catch (err) {
      setError('Failed to add reply');
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      setLoading(true);
      const getCurrentUserId = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            return parsedUser.id || 1;
          } catch (e) {
            console.error('Error parsing user data for ID:', e);
          }
        }
        return 1;
      };

      const commentData = {
        text: newContent,
        userId: getCurrentUserId()
      };

      await commentService.updateComment(commentId, commentData);

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
    } catch (err) {
      setError('Failed to edit comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        setLoading(true);
        await commentService.deleteComment(commentId);

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
      } catch (err) {
        setError('Failed to delete comment');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div ref={ref} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow ${isManageMode ? 'ring-2 ring-red-500' : ''}`}>
      <div className="p-6">
        {/* Post Header */}
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
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{displayedContent}</p>
          {post.content.length > MAX_CONTENT_LENGTH && (
            <button
              onClick={toggleShowFullContent}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2"
            >
              {showFullContent ? 'See Less' : 'See More'}
            </button>
          )}

          {post.image && isImageUrl(post.image) && <PostImage src={post.image} alt={post.title} />}

          {post.attachment && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Paperclip className="h-4 w-4 text-gray-500" />
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                {post.attachment}
              </a>
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <button
                key={tag}
                onClick={() => onSelectTag(tag)}
                className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${userVote === 'up' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'} ${isManageMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleUpvote}
                disabled={isManageMode}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm font-medium">{upvotes}</span>
              </button>

              <button
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${userVote === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'} ${isManageMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleDownvote}
                disabled={isManageMode}
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="text-sm font-medium">{downvotes}</span>
              </button>

              <button
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isManageMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isManageMode && setShowComments(!showComments)}
                disabled={isManageMode}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{comments.length}</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                className={`p-2 rounded-lg transition-colors ${bookmarked ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'} ${isManageMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleBookmark}
                disabled={isManageMode}
              >
                {bookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
              </button>

              {isManageMode && (
                <button
                  onClick={() => onDelete(post.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                  aria-label="Delete post"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg mx-6 mb-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 text-xs underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

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
                  disabled={!newComment.trim() || loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {loading && <span className="text-xs">...</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-1">
            {loading && comments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                Loading comments...
              </p>
            ) : comments.length === 0 ? (
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
}));

export default PostCard;
