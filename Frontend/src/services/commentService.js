import { getApiUrlWithSuffix } from './apiConfig';

const API_BASE_URL = import.meta.env.DEV ? '/api' : getApiUrlWithSuffix();

// Helper function to get auth token
const getAuthToken = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token || userData.jwt;
    } catch (e) {
      console.error('Error parsing user data for token:', e);
    }
  }
  return null;
};

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.id || 1;
    } catch (e) {
      console.error('Error parsing user data for ID:', e);
    }
  }
  return 1;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

class CommentService {
  // Get comments for a post
  async getCommentsForPost(postId) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Create a new comment
  async createComment(postId, commentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          text: commentData.text,
          userId: commentData.userId || getCurrentUserId()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create comment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Update a comment
  async updateComment(commentId, commentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/comments/${commentId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          text: commentData.text,
          userId: commentData.userId || getCurrentUserId()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update comment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Delete a comment
  async deleteComment(commentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/comments/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete comment: ${response.status}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new CommentService();