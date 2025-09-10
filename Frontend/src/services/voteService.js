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

class VoteService {
  // Get votes for a post
  async getVotesForPost(postId) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/votes`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch votes: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Create or update a vote (like/dislike)
  async vote(postId, voteType, userId = null) {
    if (!userId) {
      userId = getCurrentUserId();
    }
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/vote`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          postId: postId,
          userId: userId,
          voteType: voteType // "UPVOTE" or "DOWNVOTE"
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to vote: ${response.status}`);
      }

      // If response is 204 (No Content), it means vote was removed
      if (response.status === 204) {
        return { removed: true };
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Remove a vote
  async removeVote(postId, voteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/votes/${voteId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to remove vote: ${response.status}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Helper method to upvote
  async upvote(postId, userId = null) {
    return this.vote(postId, 'UPVOTE', userId);
  }

  // Helper method to downvote
  async downvote(postId, userId = null) {
    return this.vote(postId, 'DOWNVOTE', userId);
  }

  // Get current user's vote for a post
  async getUserVoteForPost(postId, userId = null) {
    if (!userId) {
      userId = getCurrentUserId();
    }
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/votes/user/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (response.status === 404) {
        return null; // User hasn't voted
      }

      if (!response.ok) {
        throw new Error(`Failed to get user vote: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export default new VoteService();