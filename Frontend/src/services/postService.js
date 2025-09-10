// API base URL - adjust this to match your backend
// Use relative URL in development to leverage Vite proxy, full URL in production
const API_BASE_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL + '/api' || 'http://localhost:5454/api');

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
        console.error('Error parsing user data:', e);
      }
    }
    
    // Fallback to jwt_token if no user data found
    if (!token) {
      token = localStorage.getItem('jwt_token');
    }
    
    console.log('Auth token found:', token ? 'Yes' : 'No'); // Debug log
    console.log('Token value:', token); // Debug log
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    console.log('Final headers:', headers); // Debug log
    return headers;
  }

  // Helper method to get current user ID
  getCurrentUserId() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        return parsedUser.id || 1; // Fallback to 1 if no ID found
      } catch (e) {
        console.error('Error parsing user data for ID:', e);
      }
    }
    return 1; // Default fallback
  }
  async getAllPosts() {
    try {
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('DEV mode:', import.meta.env.DEV);
      console.log('Fetching posts from:', `${API_BASE_URL}/posts`);
      console.log('Auth headers:', this.getAuthHeaders());
      
      const response = await fetch(`${API_BASE_URL}/posts`, {
        headers: this.getAuthHeaders()
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch posts: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Posts data received:', data);
      return data;
    } catch (error) {
      console.error('getAllPosts error:', error);
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
        userId: postData.userId || this.getCurrentUserId(),
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