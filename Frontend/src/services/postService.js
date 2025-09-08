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
        console.error('Error parsing user data:', e);
      }
    }
    
    // Fallback to jwt_token if no user data found
    if (!token) {
      token = localStorage.getItem('jwt_token');
    }
    
    console.log('PostService: Using token:', token ? 'Token found' : 'No token');
    
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
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async createPost(postData) {
    try {
      console.log('PostService: Starting createPost with data:', postData);
      
      // Transform the data to match backend expectations
      const requestData = {
        title: postData.title,
        content: postData.content,
        mediaUrl: postData.mediaUrl,
        userId: postData.userId || 1,
        tags: postData.tags || []
      };

      console.log('PostService: Transformed request data:', requestData);
      console.log('PostService: API URL:', `${API_BASE_URL}/posts`);
      console.log('PostService: Headers:', this.getAuthHeaders());

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestData),
      });
      
      console.log('PostService: Response status:', response.status);
      console.log('PostService: Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('PostService: Error response:', errorText);
        throw new Error(`Failed to create post: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('PostService: Success response:', result);
      return result;
    } catch (error) {
      console.error('PostService: Error creating post:', error);
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
      console.error('Error deleting post:', error);
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
      console.error('Error fetching post:', error);
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
      console.error('Error updating post:', error);
      throw error;
    }
  }
}

// Export as named export to match the import in PostFeed
export const postService = new PostService();