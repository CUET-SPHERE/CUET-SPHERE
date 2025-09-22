import React, { useState } from 'react';
import { X, Image, Paperclip } from 'lucide-react';
import TagInput from './TagInput';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

// This could be fetched from a DB in a real app
const MOCK_EXISTING_TAGS = ['help', 'resource', 'question', 'announcement', 'data-structures', 'exam-prep', 'physics', 'algorithms', 'study-group'];

function PostCreateModal({ open, onClose, onCreate }) {
  const { isAuthenticated, user } = useUser();
  const { colors, buttonClasses } = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!open) return null;

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    // Get auth headers similar to postService
    const userData = localStorage.getItem('user');
    let token = null;

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        token = parsedUser.token || parsedUser.jwt;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    if (!token) {
      token = localStorage.getItem('jwt_token');
    }

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const API_BASE_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_BASE_URL || 'https://cuetsphere-backend-cuet-sphere.vercel.app/api';

    const response = await fetch(`${API_BASE_URL}/upload/post`, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }

    return result.fileUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        setError('You must be logged in to create a post. Please sign in first.');
        setLoading(false);
        return;
      }

      if (!title || !content) {
        setError('Title and content are required.');
        setLoading(false);
        return;
      }
      if (tags.length === 0) {
        setError('Please add at least one tag to your post.');
        setLoading(false);
        return;
      }

      let finalMediaUrl = imageUrl || null;

      // If a file is selected, upload it first
      if (file) {
        try {
          setUploading(true);
          finalMediaUrl = await uploadFile(file);
          setUploading(false);
        } catch (uploadError) {
          setUploading(false);
          setError(`File upload failed: ${uploadError.message}`);
          setLoading(false);
          return;
        }
      }

      await onCreate({
        title,
        content,
        tags,
        mediaUrl: finalMediaUrl,
        userId: user.id || 1, // Use actual user ID from context
      });

      // Reset form
      setTitle('');
      setContent('');
      setTags([]);
      setFile(null);
      setImageUrl('');
      setError('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`${colors?.modalBackground || 'bg-white dark:bg-gray-800'} rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${colors?.borderLight || 'border-gray-200 dark:border-gray-700'}`}>
          <h2 className={`text-xl font-bold ${colors?.text || 'text-gray-900 dark:text-white'}`}>Create New Post</h2>
          <button
            onClick={onClose}
            className={`p-2 ${colors?.textMuted || 'text-gray-400'} hover:${colors?.textMutedHover || 'text-gray-600 dark:text-gray-300'} rounded-lg hover:${colors?.hoverBackground || 'bg-gray-100 dark:bg-gray-700'} transition-colors`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className={`block text-sm font-medium ${colors?.textSecondary || 'text-gray-700 dark:text-gray-300'} mb-2`}>
              Title
            </label>
            <input
              type="text"
              className={`w-full px-4 py-3 ${colors?.border || 'border-gray-300 dark:border-gray-600'} border rounded-lg ${colors?.inputBackground || 'bg-white dark:bg-gray-700'} ${colors?.text || 'text-gray-900 dark:text-white'} ${colors?.placeholder || 'placeholder-gray-500 dark:placeholder-gray-400'} focus:ring-2 ${colors?.focusRing || 'focus:ring-blue-500'} focus:border-transparent`}
              placeholder="What's your post about?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${colors?.textSecondary || 'text-gray-700 dark:text-gray-300'} mb-2`}>
              Content
            </label>
            <textarea
              className={`w-full px-4 py-3 ${colors?.border || 'border-gray-300 dark:border-gray-600'} border rounded-lg ${colors?.inputBackground || 'bg-white dark:bg-gray-700'} ${colors?.text || 'text-gray-900 dark:text-white'} ${colors?.placeholder || 'placeholder-gray-500 dark:placeholder-gray-400'} focus:ring-2 ${colors?.focusRing || 'focus:ring-blue-500'} focus:border-transparent resize-none`}
              placeholder="Share your thoughts, questions, or announcements..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${colors?.textSecondary || 'text-gray-700 dark:text-gray-300'} mb-2`}>
              Tags (at least one)
            </label>
            <TagInput
              tags={tags}
              setTags={setTags}
              allTags={MOCK_EXISTING_TAGS}
              placeholder="Add tags like 'help', 'exam-prep'..."
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${colors?.textSecondary || 'text-gray-700 dark:text-gray-300'} mb-2`}>
              Image URL (optional)
            </label>
            <div className="relative">
              <Image className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${colors?.textMuted || 'text-gray-400'}`} />
              <input
                type="url"
                className={`w-full pl-11 pr-4 py-3 ${colors?.border || 'border-gray-300 dark:border-gray-600'} border rounded-lg ${colors?.inputBackground || 'bg-white dark:bg-gray-700'} ${colors?.text || 'text-gray-900 dark:text-white'} ${colors?.placeholder || 'placeholder-gray-500 dark:placeholder-gray-400'} focus:ring-2 ${colors?.focusRing || 'focus:ring-blue-500'} focus:border-transparent`}
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${colors?.textSecondary || 'text-gray-700 dark:text-gray-300'} mb-2`}>
              File Attachment (optional)
            </label>
            <div className="relative">
              <input
                type="file"
                className="hidden"
                id="file-upload"
                onChange={(e) => setFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp4,.avi,.mov,.wmv,.webm"
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center gap-3 w-full p-4 border-2 border-dashed ${colors?.border || 'border-gray-300 dark:border-gray-600'} rounded-lg hover:${colors?.borderHover || 'border-blue-400 dark:border-blue-500'} cursor-pointer transition-colors ${colors?.cardSecondary || 'bg-gray-50 dark:bg-gray-700'} hover:${colors?.cardSecondaryHover || 'bg-gray-100 dark:bg-gray-600'}`}
              >
                <Paperclip className={`h-5 w-5 ${colors?.textMuted || 'text-gray-400'}`} />
                <div className="text-center flex-1">
                  <span className={colors?.textSecondary || 'text-gray-600 dark:text-gray-300'}>
                    {file ? file.name : 'Click to upload a file'}
                  </span>
                  <p className={`text-xs ${colors?.textMuted || 'text-gray-500 dark:text-gray-400'} mt-1`}>
                    Images & Documents (max 10MB), Videos (max 50MB)
                  </p>
                  <p className={`text-xs ${colors?.textMuted || 'text-gray-500 dark:text-gray-400'}`}>
                    Supported: PDF, DOC, TXT, JPG, PNG, GIF, MP4, AVI, MOV
                  </p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className={`p-3 bg-red-100 dark:bg-red-900 ${colors?.border || 'border-red-200 dark:border-red-700'} border rounded-lg`}>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className={buttonClasses?.secondary || "px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className={buttonClasses?.primary || "px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors shadow-sm"}
            >
              {uploading ? 'Uploading file...' : loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostCreateModal;
