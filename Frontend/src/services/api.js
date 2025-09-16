import EmailService from './emailService';

const API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5454');
const DEV_MODE = false; // Set to false to use real APIs

// Helper function to get auth token
const getAuthToken = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.token;
  }
  return null;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`
    }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

// Mock data for development
const mockUsers = [
  {
    id: 1,
    fullName: 'Muhammad Rony',
    email: 'rony@student.cuet.ac.bd',
    role: 'STUDENT',
    department: 'Computer Science & Engineering',
    batch: '22',
    hall: 'Bangabandhu Sheikh Mujibur Rahman Hall',
    studentId: '2204005'
  },
  {
    id: 2,
    fullName: 'CR User',
    email: 'cr@student.cuet.ac.bd',
    role: 'CR',
    department: 'Computer Science & Engineering',
    batch: '22',
    hall: 'Bangabandhu Sheikh Mujibur Rahman Hall',
    studentId: '2204001'
  },
  {
    id: 3,
    fullName: 'Admin User',
    email: 'u2204015@student.cuet.ac.bd',
    role: 'SYSTEM_ADMIN',
    department: 'System',
    batch: '22',
    hall: 'N/A',
    studentId: '2204015'
  }
];

// API service class
class ApiService {
  // Authentication APIs
  static async requestSignupOtp(userData) {
    if (DEV_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if email already exists
      const existingUser = mockUsers.find(user => user.email === userData.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Store user data in localStorage temporarily (just for development)
      localStorage.setItem('pendingSignup', JSON.stringify(userData));

      return {
        success: true,
        message: 'OTP sent successfully to your email',
        email: userData.email
      };
    }

    // Store signup data in sessionStorage for later use
    sessionStorage.setItem('pendingSignupData', JSON.stringify(userData));

    const response = await fetch(`${API_BASE_URL}/auth/signup-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userData.email }),
    });

    return handleResponse(response);
  }

  static async signup(userData, otp) {
    if (DEV_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In dev mode, we'll pretend OTP was validated already
      // Create new user
      const newUser = {
        id: mockUsers.length + 1,
        ...userData,
        role: 'STUDENT',
        studentId: '220400' + (mockUsers.length + 1),
        batch: '22',
        department: 'Computer Science & Engineering'
      };

      mockUsers.push(newUser);

      return {
        success: true,
        message: 'User created successfully',
        token: 'mock-jwt-token-' + Date.now(),
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        studentId: newUser.studentId,
        batch: newUser.batch,
        department: newUser.department,
        hall: newUser.hall
      };
    }

    // First, verify the OTP
    const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify-signup-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        otp: otp
      }),
    });

    const verifyResult = await handleResponse(verifyResponse);

    if (!verifyResult.success) {
      throw new Error(verifyResult.message || 'Invalid OTP. Please try again.');
    }

    // Now create the account
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  }

  static async signin(credentials) {
    if (DEV_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user by email
      const user = mockUsers.find(u => u.email === credentials.email);
      if (!user) {
        throw new Error('User not found');
      }

      // Mock password validation (in real app, this would be server-side)
      const mockPasswords = {
        'rony@student.cuet.ac.bd': 'rony123',
        'cr@student.cuet.ac.bd': 'cr123',
        'u2204015@student.cuet.ac.bd': 'asdf'
      };

      if (mockPasswords[credentials.email] !== credentials.password) {
        throw new Error('Invalid password');
      }

      return {
        success: true,
        message: 'Signin successful',
        token: 'mock-jwt-token-' + Date.now(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        batch: user.batch,
        department: user.department,
        hall: user.hall
      };
    }

    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  }

  // Password Reset APIs
  static async requestPasswordReset(email, type = 'password-reset') {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, type }),
    });
    return handleResponse(response);
  }

  static async verifyOtp(email, otp, type = 'password-reset') {
    if (DEV_MODE && type === 'signup') {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In dev mode, we'll validate any 6-digit OTP for signup
      if (otp.length === 6 && /^\d+$/.test(otp)) {
        const pendingSignup = JSON.parse(localStorage.getItem('pendingSignup') || '{}');
        return {
          success: true,
          message: 'OTP verified successfully',
          userData: pendingSignup,
          isSignup: true
        };
      } else {
        throw new Error('Invalid OTP. Please try again.');
      }
    }

    // Use different endpoints based on the type
    const endpoint = type === 'signup' ? 'verify-signup-otp' : 'verify-otp';

    const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp, type }),
    });
    return handleResponse(response);
  }

  static async resetPassword({ email, resetToken, newPassword }) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, resetToken, newPassword }),
    });
    return handleResponse(response);
  }

  // Admin APIs
  static async getAllUsers() {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockUsers;
    }

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }

  static async getUsersByDepartmentAndBatch(department, batch) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockUsers.filter(user =>
        user.department === department && user.batch === batch
      );
    }

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/admin/users/department/${department}/batch/${batch}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }

  static async getUserByEmail(email) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockUsers.find(user => user.email === email);
    }

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${email}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }

  static async assignCrRole(userEmail) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));

      const user = mockUsers.find(u => u.email === userEmail);
      if (!user) {
        throw new Error('User not found');
      }

      user.role = 'CR';

      return {
        success: true,
        message: 'CR role assigned successfully',
        user: user
      };
    }

    const token = getAuthToken();
    // Get current user info to get department and batch
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const response = await fetch(`${API_BASE_URL}/api/admin/assign-cr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail: userEmail,
        department: currentUser.department || '04',
        batch: currentUser.batch || '22'
      }),
    });
    return handleResponse(response);
  }

  static async removeCrRole(userEmail) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));

      const user = mockUsers.find(u => u.email === userEmail);
      if (!user) {
        throw new Error('User not found');
      }

      user.role = 'STUDENT';

      return {
        success: true,
        message: 'CR role removed successfully',
        user: user
      };
    }

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/admin/remove-cr/${userEmail}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  static async getSystemInfo() {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        systemAdminEmail: 'u2204015@student.cuet.ac.bd',
        message: 'System information retrieved successfully'
      };
    }

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/admin/system-info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }

  // Notice APIs
  static async createNotice(noticeData) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newNotice = {
        noticeId: Date.now(),
        ...noticeData,
        senderName: 'Mock User',
        senderEmail: 'mock@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        department: '04',
        batch: '22'
      };
      return { success: true, noticeId: newNotice.noticeId, notice: newNotice };
    }

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/notices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noticeData),
    });
    const result = await handleResponse(response);
    return result;
  }

  static async getAllNotices(page = 0, size = 10) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const start = page * size;
      const end = start + size;
      const paginatedNotices = mockNotices.slice(start, end);
      return {
        content: paginatedNotices,
        totalElements: mockNotices.length,
        totalPages: Math.ceil(mockNotices.length / size),
        hasNext: end < mockNotices.length,
        hasPrevious: page > 0
      };
    }

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/notices?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const result = await handleResponse(response);
    return result;
  }

  static async getNoticeById(id) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/notices/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }

  static async updateNotice(id, noticeData) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/notices/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noticeData),
    });
    return handleResponse(response);
  }

  static async deleteNotice(noticeId) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Notice deleted successfully' };
    }

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/notices/${noticeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const result = await handleResponse(response);
    return result;
  }

  static async getMyNotices() {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          noticeId: 1,
          title: 'Class Test Schedule',
          message: 'Class test for Data Structures will be held on Friday.',
          senderName: 'Admin',
          senderEmail: 'u2204015@student.cuet.ac.bd',
          createdAt: new Date().toISOString(),
          department: '04',
          batch: '22',
          noticeType: 'ACADEMIC',
          attachment: null
        }
      ];
    }
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/notices/my`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
  }

  static async getGroupMembers() {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        { id: 1, fullName: 'Admin', email: 'u2204015@student.cuet.ac.bd', role: 'SYSTEM_ADMIN', studentId: '015', hall: 'bb', isOnline: true },
        { id: 2, fullName: 'John Doe', email: 'u2204001@student.cuet.ac.bd', role: 'STUDENT', studentId: '001', hall: 'aa', isOnline: false }
      ];
    }
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/notices/group-members`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse(response);
  }

  // Resource APIs
  static async uploadResource(resourceData) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/resources`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resourceData),
    });
    return handleResponse(response);
  }

  static async getAllResources() {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: 1,
          title: 'Data Structures Notes',
          description: 'Comprehensive notes for Data Structures course',
          fileUrl: '/resources/ds-notes.pdf',
          author: 'u2204015@student.cuet.ac.bd',
          createdAt: new Date().toISOString(),
          department: '04',
          batch: '22'
        },
        {
          id: 2,
          title: 'Algorithm Practice Problems',
          description: 'Collection of practice problems for algorithms',
          fileUrl: '/resources/algo-problems.pdf',
          author: 'u2204015@student.cuet.ac.bd',
          createdAt: new Date().toISOString(),
          department: '04',
          batch: '22'
        }
      ];
    }

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/resources`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }

  static async getResourceById(id) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }

  static async updateResource(id, resourceData) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resourceData),
    });
    return handleResponse(response);
  }

  static async deleteResource(id) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }

  // File upload APIs
  static async uploadFile(file, onProgress) {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.open('POST', `${API_BASE_URL}/api/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  }

  // Profile picture upload to S3
  static async uploadProfilePicture(file, type = 'profile') {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        message: 'Profile picture uploaded successfully',
        fileUrl: `https://mock-s3-bucket.s3.amazonaws.com/${type}/${Date.now()}-${file.name}`,
        fileName: file.name
      };
    }

    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/api/upload/profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse(response);
  }

  // Update user profile
  static async updateUserProfile(profileData) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Profile updated successfully' };
    }
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  }
}

export default ApiService;
