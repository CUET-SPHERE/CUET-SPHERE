const API_BASE_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL + '/api' || 'http://localhost:5454/api');

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

class ReplyService {
  // Get replies for a comment
  async getRepliesForComment(commentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/comments/${commentId}/replies`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch replies: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Create a new reply
  async createReply(commentId, replyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/comments/${commentId}/replies`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          text: replyData.text,
          userId: replyData.userId || getCurrentUserId()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create reply: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Update a reply
  async updateReply(commentId, replyId, replyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/comments/${commentId}/replies/${replyId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          text: replyData.text,
          userId: replyData.userId || getCurrentUserId()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update reply: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Delete a reply
  async deleteReply(commentId, replyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/comments/${commentId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete reply: ${response.status}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new ReplyService();