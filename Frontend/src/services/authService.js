const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class AuthService {
  async signin(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Login failed: ${response.status} - ${errorText}`);
      }

      const authResponse = await response.json();
      
      // Store the JWT token in localStorage
      if (authResponse.token) {
        localStorage.setItem('jwt_token', authResponse.token);
        localStorage.setItem('user_info', JSON.stringify({
          email: authResponse.email,
          fullName: authResponse.fullName,
          role: authResponse.role,
          batch: authResponse.batch,
          department: authResponse.department
        }));
      }

      return authResponse;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signup(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Signup failed: ${response.status} - ${errorText}`);
      }

      const authResponse = await response.json();
      
      // Store the JWT token in localStorage
      if (authResponse.token) {
        localStorage.setItem('jwt_token', authResponse.token);
        localStorage.setItem('user_info', JSON.stringify({
          email: authResponse.email,
          fullName: authResponse.fullName,
          role: authResponse.role,
          batch: authResponse.batch,
          department: authResponse.department
        }));
      }

      return authResponse;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
  }

  isAuthenticated() {
    return !!localStorage.getItem('jwt_token');
  }

  getToken() {
    return localStorage.getItem('jwt_token');
  }

  getUserInfo() {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }
}

export const authService = new AuthService();