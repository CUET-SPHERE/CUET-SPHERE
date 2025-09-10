// API base URL - adjust this to match your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5454/api';

class PostService {
  // Helper method to get auth headers
  getAuthHeaders() {
    // Try to get token from your existing UserContext system first
    const userData = localStorage.getItem('user');
    let token = null;
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        token = parsedUser.token || parsedUser.jwt;
      } catch (e) {
        // Error parsing user data - silently continue
      }
    }
    
    // Fallback to jwt_token if no user data found
    if (!token) {
      token = localStorage.getItem('jwt_token');
    }
    
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
  async getAllPosts() {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async createPost(postData) {
    try {
      // Transform the data to match backend expectations
      const requestData = {
        title: postData.title,
        content: postData.content,
        mediaUrl: postData.mediaUrl,
        userId: postData.userId || 1,
        tags: postData.tags || []
      };

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create post: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async deletePost(postId) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getPostById(postId) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async updatePost(postId, postData) {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update post: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

// Export as named export to match the import in PostFeed
export const postService = new PostService();