import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, MessageCircle, Paperclip, Send, ImageIcon, Trash2, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { formatTimeAgo, getInitials, getAvatarColor, isImageUrl, isVideoUrl } from '../utils/formatters';
import { useTheme } from '../contexts/ThemeContext';
import commentService from '../services/commentService';
import replyService from '../services/replyService';
import voteService from '../services/voteService';
import ApiService from '../services/api';
import { postService } from '../services/postService';

// Avatar component
const Avatar = React.memo(({ src, name, size = 'md' }) => {
  const { colors } = useTheme();
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
        className={`${sizeClasses[size]} rounded-full object-cover border-2 ${colors?.border || 'border-gray-200'}`}
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
  const { colors, buttonClasses } = useTheme();
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
    <div className={`${depth > 0 ? `ml-6 border-l-2 ${colors?.borderLight || 'border-gray-200 dark:border-gray-600'} pl-4` : ''}`}>
      <div className="flex gap-3 py-3">
        <Avatar src={comment.profilePicture} name={comment.author} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium ${colors?.text || 'text-gray-900 dark:text-white'} text-sm`}>{comment.author}</span>
            <span className={`text-xs ${colors?.textMuted || 'text-gray-500 dark:text-gray-400'}`}>ID: {comment.studentId}</span>
            <span className={`text-xs ${colors?.textMuted || 'text-gray-500 dark:text-gray-400'}`}>•</span>
            <span className={`text-xs ${colors?.textMuted || 'text-gray-500 dark:text-gray-400'}`}>{formatTimeAgo(comment.timestamp)}</span>
            {comment.isEdited && (
              <>
                <span className={`text-xs ${colors?.textMuted || 'text-gray-500 dark:text-gray-400'}`}>•</span>
                <span className={`text-xs ${colors?.textMuted || 'text-gray-500 dark:text-gray-400'} italic`}>edited</span>
              </>
            )}
          </div>

          {isEditing ? (
            <div className="mb-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'edit')}
                className={`w-full px-3 py-2 ${colors?.border || 'border-gray-300 dark:border-gray-600'} border rounded-lg ${colors?.inputBackground || 'bg-white dark:bg-gray-700'} ${colors?.text || 'text-gray-900 dark:text-white'} text-sm resize-none`}
                rows="2"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEdit}
                  className={buttonClasses?.success || "px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className={buttonClasses?.secondary || "px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-400 dark:hover:bg-gray-500"}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className={`${colors?.textSecondary || 'text-gray-700 dark:text-gray-300'} text-sm mb-2`}>{comment.content}</p>
          )}

          {!isEditing && (
            <div className="flex items-center gap-4 text-xs">
              {depth < maxDepth && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className={`${colors?.textMuted || 'text-gray-500 dark:text-gray-400'} hover:${colors?.primaryHover || 'text-blue-600 dark:text-blue-400'} font-medium`}
                >
                  Reply
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`${colors?.textMuted || 'text-gray-500 dark:text-gray-400'} hover:text-green-600 dark:hover:text-green-400 font-medium`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(comment.id)}
                    className={`${colors?.textMuted || 'text-gray-500 dark:text-gray-400'} hover:text-red-600 dark:hover:text-red-400 font-medium`}
                  >
                    Delete
                  </button>
                </>
              )}
              {comment.replies && comment.replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className={`${colors?.textMuted || 'text-gray-500 dark:text-gray-400'} hover:${colors?.primaryHover || 'text-blue-600 dark:text-blue-400'} font-medium`}
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
                  className={`w-full px-3 py-2 ${colors?.border || 'border-gray-300 dark:border-gray-600'} border rounded-lg ${colors?.inputBackground || 'bg-white dark:bg-gray-700'} ${colors?.text || 'text-gray-900 dark:text-white'} text-sm resize-none`}
                  rows="2"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleReply}
                    disabled={!replyContent.trim()}
                    className={buttonClasses?.primary || "px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"}
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent('');
                    }}
                    className={buttonClasses?.secondary || "px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-400 dark:hover:bg-gray-500"}
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
  const { colors } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Preload image in background to improve perceived loading speed
  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => setImageLoading(false);
    img.onerror = () => {
      setImageError(true);
      setImageLoading(false);
    };
    img.src = src;
  }, [src]);

  if (!src || imageError) {
    return null;
  }

  return (
    <div className={`mt-3 mb-3 rounded-lg overflow-hidden ${colors?.cardBackground || 'bg-gray-100 dark:bg-gray-800'}`}>
      {imageLoading && (
        <div className={`flex items-center justify-center h-64 ${colors?.cardSecondary || 'bg-gray-200 dark:bg-gray-700'}`}>
          <div className={`animate-pulse flex items-center gap-2 ${colors?.textMuted || 'text-gray-500'}`}>
            <ImageIcon className="h-6 w-6" />
            <span>Loading image...</span>
          </div>
        </div>
      )}
      {!imageLoading && (
        <img
          src={src}
          alt={alt}
          className="w-full max-h-96 object-contain"
          loading="lazy"
        />
      )}
    </div>
  );
});

const PostVideo = React.memo(({ src, alt }) => {
  const { colors } = useTheme();
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  if (!src || videoError) {
    return null;
  }

  return (
    <div className={`mt-3 mb-3 rounded-lg overflow-hidden ${colors?.cardBackground || 'bg-gray-100 dark:bg-gray-800'}`}>
      {videoLoading && (
        <div className={`flex items-center justify-center h-64 ${colors?.cardSecondary || 'bg-gray-200 dark:bg-gray-700'}`}>
          <div className={`animate-pulse flex items-center gap-2 ${colors?.textMuted || 'text-gray-500'}`}>
            <ImageIcon className="h-6 w-6" />
            <span>Loading video...</span>
          </div>
        </div>
      )}
      <video
        src={src}
        controls
        className={`w-full max-h-96 ${videoLoading ? 'hidden' : 'block'}`}
        onLoadedMetadata={() => setVideoLoading(false)} // Fires earlier than onLoadedData
        onError={() => {
          setVideoError(true);
          setVideoLoading(false);
        }}
        preload="metadata"
      >
        <p className={colors?.textMuted || 'text-gray-500'}>
          Your browser doesn't support HTML video. Here is a{' '}
          <a href={src} className={colors?.primary || 'text-blue-600 hover:underline'}>
            link to the video
          </a>{' '}
          instead.
        </p>
      </video>
    </div>
  );
});

const PostCard = React.memo(React.forwardRef(({ post, isManageMode = false, onDelete, onSelectTag }, ref) => {
  const { colors, buttonClasses } = useTheme();
  const [upvotes, setUpvotes] = useState(post.upvotes || 0);
  const [downvotes, setDownvotes] = useState(post.downvotes || 0);
  const [bookmarked, setBookmarked] = useState(post.bookmarked || post.saved || false);
  const [userVote, setUserVote] = useState(null); // 'up' | 'down' | null
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showFullContent, setShowFullContent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const MAX_CONTENT_LENGTH = 200; // Adjust as needed

  // Get current user info
  const getCurrentUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        return {
          id: parsedUser.id,
          email: parsedUser.email,
          role: parsedUser.role || 'STUDENT'
        };
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    return null;
  };

  const currentUser = getCurrentUser();

  // Check if current user can delete this post
  const canDeletePost = () => {
    if (!currentUser) return false;

    // Admin users can delete any post in manage mode
    if (isManageMode && currentUser.role === 'SYSTEM_ADMIN') {
      return true;
    }

    // Post owners can always delete their own posts
    return (
      post.userId === currentUser.id ||
      post.authorEmail === currentUser.email
    );
  };

  const displayedContent = post.content.length > MAX_CONTENT_LENGTH && !showFullContent
    ? `${post.content.substring(0, MAX_CONTENT_LENGTH)}...`
    : post.content;

  const toggleShowFullContent = () => {
    setShowFullContent(!showFullContent);
  };

  // Load comments initially when component mounts
  useEffect(() => {
    // If post already has comments from the backend, use them
    if (post.comments && post.comments.length > 0) {
      setComments(post.comments);
      setCommentsLoaded(true);
    } else {
      // If no comments are preloaded, mark as loaded (empty state)
      setComments([]);
      setCommentsLoaded(true);
    }
  }, [post.id, post.comments]);  // Load comments when showComments is toggled and not already loaded
  useEffect(() => {
    // Only load comments from API if:
    // 1. User wants to see comments (showComments is true)
    // 2. Comments are not already loaded (commentsLoaded is false)
    // 3. Post doesn't have preloaded comments
    if (showComments && !commentsLoaded && (!post.comments || post.comments.length === 0)) {
      loadComments();
    }
  }, [showComments, commentsLoaded, post.comments]);

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
        // If user vote not found, that's fine - means user hasn't voted
        setUserVote(null);
      }
    } catch (err) {
      console.error('Error loading votes:', err);
    }
  };

  // Refresh vote counts and current user's vote status after voting
  // This prevents race conditions when multiple users vote simultaneously
  const refreshVoteCounts = async () => {
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

      // Use the more efficient vote counts endpoint
      const voteCounts = await voteService.getVoteCountsForPost(post.id);

      // Update counts with server truth
      setUpvotes(voteCounts.upvotes || 0);
      setDownvotes(voteCounts.downvotes || 0);

      // Load current user's vote to sync UI state
      try {
        const userVoteObj = await voteService.getUserVoteForPost(post.id, currentUserId);
        if (userVoteObj) {
          setUserVote(userVoteObj.voteType === 'UPVOTE' ? 'up' : 'down');
        } else {
          setUserVote(null);
        }
      } catch (userVoteErr) {
        // If user vote not found, user hasn't voted
        setUserVote(null);
      }
    } catch (err) {
      console.error('Error refreshing vote counts:', err);
      // Don't show error to user for refresh failures
    }
  };

  const handleUpvote = async () => {
    // Store original state for rollback
    const originalUpvotes = upvotes;
    const originalDownvotes = downvotes;
    const originalUserVote = userVote;

    try {
      // Optimistic update - update UI immediately
      if (userVote === 'up') {
        // User is removing their upvote
        setUpvotes(upvotes - 1);
        setUserVote(null);
      } else {
        // User is upvoting (either new vote or switching from downvote)
        setUpvotes(upvotes + 1);
        if (userVote === 'down') setDownvotes(downvotes - 1);
        setUserVote('up');
      }

      // Send request to server
      const result = await voteService.upvote(post.id);

      // After successful vote, refresh the actual vote counts from server
      // This prevents race conditions when multiple users vote simultaneously
      await refreshVoteCounts();
    } catch (err) {
      // Rollback optimistic update on error
      setUpvotes(originalUpvotes);
      setDownvotes(originalDownvotes);
      setUserVote(originalUserVote);
      setError('Failed to vote');
    }
  };

  const handleDownvote = async () => {
    // Store original state for rollback
    const originalUpvotes = upvotes;
    const originalDownvotes = downvotes;
    const originalUserVote = userVote;

    try {
      // Optimistic update - update UI immediately
      if (userVote === 'down') {
        // User is removing their downvote
        setDownvotes(downvotes - 1);
        setUserVote(null);
      } else {
        // User is downvoting (either new vote or switching from upvote)
        setDownvotes(downvotes + 1);
        if (userVote === 'up') setUpvotes(upvotes - 1);
        setUserVote('down');
      }

      // Send request to server
      const result = await voteService.downvote(post.id);

      // After successful vote, refresh the actual vote counts from server
      // This prevents race conditions when multiple users vote simultaneously
      await refreshVoteCounts();
    } catch (err) {
      // Rollback optimistic update on error
      setUpvotes(originalUpvotes);
      setDownvotes(originalDownvotes);
      setUserVote(originalUserVote);
      setError('Failed to vote');
    }
  };

  const handleBookmark = async () => {
    try {
      const newBookmarkState = !bookmarked;

      // Optimistically update UI
      setBookmarked(newBookmarkState);

      // Call API to save/unsave
      if (newBookmarkState) {
        const response = await ApiService.savePost(post.id);
        if (!response.success) {
          // Revert on failure
          setBookmarked(!newBookmarkState);
          console.error('Failed to save post:', response.message);
        }
      } else {
        const response = await ApiService.unsavePost(post.id);
        if (!response.success) {
          // Revert on failure
          setBookmarked(!newBookmarkState);
          console.error('Failed to unsave post:', response.message);
        }
      }
    } catch (error) {
      // Revert on error
      setBookmarked(bookmarked);
      console.error('Error handling bookmark:', error);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
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

      const getCurrentUser = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            const user = {
              id: parsedUser.id || 1,
              fullName: parsedUser.fullName || 'You',
              email: parsedUser.email || 'you@student.cuet.ac.bd',
              studentId: parsedUser.studentId || '0000000',
              profilePicture: parsedUser.profilePicture
            };
            // Generate fallback avatar URL if no profile picture
            if (!user.profilePicture) {
              user.profilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=3b82f6&color=ffffff&size=200`;
            }
            return user;
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }
        const fallbackUser = {
          id: 1,
          fullName: 'You',
          email: 'you@student.cuet.ac.bd',
          studentId: '0000000',
          profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent('You')}&background=3b82f6&color=ffffff&size=200`
        };
        return fallbackUser;
      };

      // Create optimistic comment object
      const currentUser = getCurrentUser();
      const optimisticComment = {
        id: Date.now(), // Temporary ID
        text: newComment.trim(),
        content: newComment.trim(),
        author: currentUser.fullName,
        authorEmail: currentUser.email,
        studentId: currentUser.studentId,
        profilePicture: currentUser.profilePicture,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        isEdited: false,
        replies: []
      };

      try {
        setLoading(true);

        // Optimistically add comment to UI immediately
        setComments([...comments, optimisticComment]);
        setNewComment('');

        const commentData = {
          text: newComment.trim(),
          userId: currentUser.id
        };

        const createdComment = await commentService.createComment(post.id, commentData);

        // Replace optimistic comment with real comment from server
        setComments(currentComments =>
          currentComments.map(comment =>
            comment.id === optimisticComment.id
              ? { ...createdComment, replies: createdComment.replies || [] }
              : comment
          )
        );
      } catch (err) {
        // Remove optimistic comment on error
        setComments(currentComments =>
          currentComments.filter(comment => comment.id !== optimisticComment.id)
        );
        setNewComment(newComment.trim()); // Restore the comment text
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
    const getCurrentUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          const user = {
            id: parsedUser.id || 1,
            fullName: parsedUser.fullName || 'You',
            email: parsedUser.email || 'you@student.cuet.ac.bd',
            studentId: parsedUser.studentId || '0000000',
            profilePicture: parsedUser.profilePicture
          };
          // Generate fallback avatar URL if no profile picture
          if (!user.profilePicture) {
            user.profilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=3b82f6&color=ffffff&size=200`;
          }
          return user;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      const fallbackUser = {
        id: 1,
        fullName: 'You',
        email: 'you@student.cuet.ac.bd',
        studentId: '0000000',
        profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent('You')}&background=3b82f6&color=ffffff&size=200`
      };
      return fallbackUser;
    };

    const currentUser = getCurrentUser();

    // Create optimistic reply object
    const optimisticReply = {
      id: Date.now(), // Temporary ID
      text: replyContent,
      content: replyContent,
      author: currentUser.fullName,
      authorEmail: currentUser.email,
      studentId: currentUser.studentId,
      profilePicture: currentUser.profilePicture,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      isEdited: false,
      replies: [] // Replies don't have nested replies in this implementation
    };

    try {
      setLoading(true);

      // Optimistically add reply to UI immediately
      const updateCommentsWithOptimisticReply = (comments) => {
        return comments.map(comment => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), optimisticReply]
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentsWithOptimisticReply(comment.replies)
            };
          }
          return comment;
        });
      };

      setComments(updateCommentsWithOptimisticReply(comments));

      const replyData = {
        text: replyContent,
        userId: currentUser.id
      };

      const createdReply = await replyService.createReply(parentCommentId, replyData);

      // Replace optimistic reply with real reply from server
      const updateCommentsWithRealReply = (comments) => {
        return comments.map(comment => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replies: (comment.replies || []).map(reply =>
                reply.id === optimisticReply.id
                  ? { ...createdReply, isEdited: false, replies: [] }
                  : reply
              )
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentsWithRealReply(comment.replies)
            };
          }
          return comment;
        });
      };

      setComments(updateCommentsWithRealReply(comments));
    } catch (err) {
      // Remove optimistic reply on error
      const removeOptimisticReply = (comments) => {
        return comments.map(comment => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replies: (comment.replies || []).filter(reply => reply.id !== optimisticReply.id)
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: removeOptimisticReply(comment.replies)
            };
          }
          return comment;
        });
      };

      setComments(removeOptimisticReply(comments));
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

  // Handle post deletion with modal
  const handleDeletePost = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    setDeleteSuccess(false);

    try {
      console.log('Attempting to delete post:', post.id);
      const result = await postService.deletePost(post.id);
      console.log('Delete result:', result);

      if (result === true || result) {
        setDeleteSuccess(true);

        // Auto-close modal and remove post after showing success
        setTimeout(() => {
          setShowDeleteModal(false);
          onDelete(post.id); // Call parent's delete handler to remove from feed
        }, 1500);
      } else {
        throw new Error('Delete operation failed');
      }

    } catch (err) {
      console.error('Delete error:', err);
      setDeleteError(err.message || 'Failed to delete post');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Reset delete modal state when closing
  const handleCloseDeleteModal = () => {
    if (!deleteLoading) {
      setShowDeleteModal(false);
      setDeleteError(null);
      setDeleteSuccess(false);
    }
  };

  return (
    <div ref={ref} className={`${colors?.cardBackground || 'bg-white dark:bg-gray-800'} rounded-xl shadow-sm ${colors?.border || 'border-gray-200 dark:border-gray-700'} border overflow-hidden hover:shadow-md transition-shadow ${isManageMode ? 'ring-2 ring-red-500' : ''}`}>
      <div className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar src={post.profilePicture} name={post.author} />
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${colors?.text || 'text-gray-900 dark:text-white'}`}>{post.author}</span>
                <span className={`text-sm ${colors?.textMuted || 'text-gray-500 dark:text-gray-400'}`}>•</span>
                <span className={`text-sm ${colors?.textMuted || 'text-gray-500 dark:text-gray-400'}`}>{formatTimeAgo(post.timestamp)}</span>
              </div>
              <span className={`text-sm ${colors?.textMuted || 'text-gray-500 dark:text-gray-400'}`}>Student ID: {post.studentId}</span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <h3 className={`text-lg font-semibold ${colors?.text || 'text-gray-900 dark:text-white'} mb-2`}>{post.title}</h3>
          <p className={`${colors?.textSecondary || 'text-gray-700 dark:text-gray-300'} leading-relaxed whitespace-pre-wrap`}>{displayedContent}</p>
          {post.content.length > MAX_CONTENT_LENGTH && (
            <button
              onClick={toggleShowFullContent}
              className={`${colors?.primary || 'text-blue-600 dark:text-blue-400'} hover:underline text-sm mt-2`}
            >
              {showFullContent ? 'See Less' : 'See More'}
            </button>
          )}

          {/* Media Display - Handle both images and videos */}
          {post.mediaUrl && isImageUrl(post.mediaUrl) && <PostImage src={post.mediaUrl} alt={post.title} />}
          {post.mediaUrl && isVideoUrl(post.mediaUrl) && <PostVideo src={post.mediaUrl} alt={post.title} />}

          {/* Legacy support for post.image field */}
          {!post.mediaUrl && post.image && isImageUrl(post.image) && <PostImage src={post.image} alt={post.title} />}

          {post.attachment && (
            <div className={`flex items-center gap-2 mt-3 p-3 ${colors?.cardSecondary || 'bg-gray-50 dark:bg-gray-700'} rounded-lg`}>
              <Paperclip className={`h-4 w-4 ${colors?.textMuted || 'text-gray-500'}`} />
              <a href="#" className={`${colors?.primary || 'text-blue-600 dark:text-blue-400'} hover:underline text-sm font-medium`}>
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
                className={`px-3 py-1 ${colors?.tagHighlighted || 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'} rounded-full text-sm font-medium hover:${colors?.tagHighlightedHover || 'bg-blue-200 dark:bg-blue-800'} transition-colors`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className={`pt-4 border-t ${colors?.borderLight || 'border-gray-100 dark:border-gray-700'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${userVote === 'up' ? `${colors?.voteActive || 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'}` : `${colors?.textMuted || 'text-gray-600 dark:text-gray-400'} hover:${colors?.hoverBackground || 'bg-gray-100 dark:bg-gray-700'}`} ${(isManageMode && !canDeletePost()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleUpvote}
                disabled={isManageMode && !canDeletePost()}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm font-medium">{upvotes}</span>
              </button>

              <button
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${userVote === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' : `${colors?.textMuted || 'text-gray-600 dark:text-gray-400'} hover:${colors?.hoverBackground || 'bg-gray-100 dark:bg-gray-700'}`} ${(isManageMode && !canDeletePost()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleDownvote}
                disabled={isManageMode && !canDeletePost()}
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="text-sm font-medium">{downvotes}</span>
              </button>

              <button
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${colors?.textMuted || 'text-gray-600 dark:text-gray-400'} hover:${colors?.hoverBackground || 'bg-gray-100 dark:bg-gray-700'} transition-colors ${(isManageMode && !canDeletePost()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !(isManageMode && !canDeletePost()) && setShowComments(!showComments)}
                disabled={isManageMode && !canDeletePost()}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{comments.length}</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                className={`p-2 rounded-lg transition-colors ${bookmarked ? `${colors?.bookmarkActive || 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900'}` : `${colors?.textMuted || 'text-gray-600 dark:text-gray-400'} hover:${colors?.hoverBackground || 'bg-gray-100 dark:bg-gray-700'}`} ${(isManageMode && !canDeletePost()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleBookmark}
                disabled={isManageMode && !canDeletePost()}
              >
                {bookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
              </button>

              {canDeletePost() && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md min-w-fit"
                  aria-label="Delete post"
                  title={isManageMode ? "Delete post (Admin)" : "Delete your post"}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`p-3 bg-red-100 dark:bg-red-900 ${colors?.border || 'border-red-200 dark:border-red-700'} border rounded-lg mx-6 mb-4`}>
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
        <div className={`border-t ${colors?.borderLight || 'border-gray-100 dark:border-gray-700'} ${colors?.commentsBackground || 'bg-gray-50 dark:bg-gray-750'} p-6`}>
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
                  className={`flex-1 px-4 py-2 ${colors?.border || 'border-gray-300 dark:border-gray-600'} border rounded-lg ${colors?.inputBackground || 'bg-white dark:bg-gray-700'} ${colors?.text || 'text-gray-900 dark:text-white'} ${colors?.placeholder || 'placeholder-gray-500 dark:placeholder-gray-400'} focus:ring-2 ${colors?.focusRing || 'focus:ring-blue-500'} focus:border-transparent resize-none`}
                  rows="2"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || loading}
                  className={buttonClasses?.primary || "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"}
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
              <p className={`${colors?.textMuted || 'text-gray-500 dark:text-gray-400'} text-sm text-center py-4`}>
                Loading comments...
              </p>
            ) : comments.length === 0 ? (
              <p className={`${colors?.textMuted || 'text-gray-500 dark:text-gray-400'} text-sm text-center py-4`}>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${colors?.cardBackground || 'bg-white dark:bg-gray-800'} rounded-xl shadow-xl max-w-md w-full mx-4`}>
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${colors?.text || 'text-gray-900 dark:text-white'}`}>
                  Delete Post
                </h3>
                {!deleteLoading && !deleteSuccess && (
                  <button
                    onClick={handleCloseDeleteModal}
                    className={`p-1 rounded-lg ${colors?.textMuted || 'text-gray-500 dark:text-gray-400'} hover:${colors?.hoverBackground || 'bg-gray-100 dark:bg-gray-700'} transition-colors`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Modal Content */}
              <div className="mb-6">
                {deleteSuccess ? (
                  <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-6 w-6 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Post deleted successfully!</p>
                      <p className="text-sm opacity-75">Removing from feed...</p>
                    </div>
                  </div>
                ) : deleteError ? (
                  <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-6 w-6 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Failed to delete post</p>
                      <p className="text-sm opacity-75">{deleteError}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Trash2 className="h-6 w-6 text-red-500 flex-shrink-0" />
                      <div>
                        <p className={`font-medium ${colors?.text || 'text-gray-900 dark:text-white'}`}>
                          Are you sure you want to delete this post?
                        </p>
                        <p className={`text-sm ${colors?.textMuted || 'text-gray-500 dark:text-gray-400'}`}>
                          This action cannot be undone. All comments and media will be permanently removed.
                        </p>
                      </div>
                    </div>

                    {/* Post Preview */}
                    <div className={`p-3 rounded-lg ${colors?.cardSecondary || 'bg-gray-50 dark:bg-gray-700'} mb-4`}>
                      <p className={`text-sm font-medium ${colors?.text || 'text-gray-900 dark:text-white'} truncate`}>
                        "{post.title}"
                      </p>
                      <p className={`text-xs ${colors?.textMuted || 'text-gray-500 dark:text-gray-400'} mt-1`}>
                        by {post.author}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              {!deleteSuccess && (
                <div className="flex gap-3 justify-end">
                  {!deleteLoading && (
                    <button
                      onClick={handleCloseDeleteModal}
                      className={buttonClasses?.secondary || "px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"}
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    onClick={handleDeletePost}
                    disabled={deleteLoading}
                    className={`flex items-center justify-center gap-2 px-4 py-2 min-w-[100px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors ${deleteLoading ? 'cursor-wait' : ''}`}
                  >
                    {deleteLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                        <span>Deleting...</span>
                      </>
                    ) : deleteError ? (
                      <>
                        <Trash2 className="h-4 w-4 flex-shrink-0" />
                        <span>Try Again</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 flex-shrink-0" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}));

export default PostCard;
