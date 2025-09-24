import EmailService from './emailService';
import profileCache from './profileCache';
import { getApiBaseUrl } from './apiConfig';

const API_BASE_URL = getApiBaseUrl();
const DEV_MODE = false; // Set to false to use real APIs

// Helper function to map level and term to semester ID
const getSemesterIdFromLevelTerm = (level, term) => {
  // Based on your database: 1-1=1, 1-2=2, 2-1=3, 2-2=4, 3-1=5, 3-2=6, 4-1=7, 4-2=8
  return (level - 1) * 2 + term;
};

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

    // Extract more specific error message from backend
    let errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;

    // Handle specific error cases
    if (response.status === 500) {
      if (errorMessage.includes('already exists')) {
        errorMessage = errorMessage; // Keep the specific duplicate message
      } else if (errorMessage.includes('Internal server error')) {
        // Try to extract the actual error from the message
        const match = errorMessage.match(/Internal server error: (.+)/);
        if (match) {
          errorMessage = match[1];
        }
      }
    }

    throw new Error(errorMessage);
  }

  // Check if response has content before trying to parse JSON
  const contentType = response.headers.get('content-type');
  const contentLength = response.headers.get('content-length');

  // If no content or content-length is 0, return null
  if (contentLength === '0' || response.status === 204) {
    return null;
  }

  // If content-type indicates JSON, try to parse it
  if (contentType && contentType.includes('application/json')) {
    try {
      const data = await response.json();
      return data;
    } catch (e) {
      // If JSON parsing fails but response was ok, return null
      return null;
    }
  }

  // For other content types or no content-type, try to parse as text
  try {
    const text = await response.text();
    return text || null;
  } catch (e) {
    return null;
  }
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

  static async assignCrRole(requestData) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Handle both string userEmail and object request formats
      const userEmail = typeof requestData === 'string' ? requestData : requestData.userEmail;
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
    
    // Handle both string userEmail and object request formats
    let requestBody;
    if (typeof requestData === 'string') {
      // Legacy format: just userEmail string
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      requestBody = {
        userEmail: requestData,
        department: currentUser.department || '04',
        batch: currentUser.batch || '22'
      };
    } else {
      // New format: object with userEmail, department, batch
      requestBody = {
        userEmail: requestData.userEmail,
        department: requestData.department,
        batch: requestData.batch
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/assign-cr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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

  static async getResourcesByCourse(courseCode) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/resources/course/${courseCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }

  static async getResourcesByCourseAndSemester(courseCode, semester) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/resources/course/${courseCode}/semester/${semester}`, {
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

  // Course APIs
  static async getCoursesByLevelAndTerm(department, level, term) {
    const token = getAuthToken();
    // Convert level and term to semester format (e.g. 1-1, 1-2, 2-1, etc.)
    const semester = `${level}-${term}`;

    const response = await fetch(`${API_BASE_URL}/api/courses/department/${department}/semester/${semester}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // If backend endpoint doesn't exist yet, fallback to demo data
    try {
      const result = await handleResponse(response);
      return result;
    } catch (error) {

      // Fallback data based on level and term
      await new Promise(resolve => setTimeout(resolve, 500));
      if (level === 1 && term === 1) {
        return [
          { code: 'CSE-141', name: 'Structured Programming' },
          { code: 'CSE-142', name: 'Structured Programming Lab' },
          { code: 'MAT-141', name: 'Mathematics I' },
          { code: 'PHY-141', name: 'Physics I' },
          { code: 'HUM-141', name: 'English & Economics' },
        ];
      } else if (level === 1 && term === 2) {
        return [
          { code: 'CSE-143', name: 'Discrete Mathematics' },
          { code: 'MAT-143', name: 'Mathematics II' },
          { code: 'PHY-143', name: 'Physics II' },
          { code: 'CHE-141', name: 'Chemistry' },
          { code: 'ME-143', name: 'Engineering Drawing' },
        ];
      } else {
        return [];
      }
    }
  }

  // Current Semester APIs
  static async getCurrentSemester(department, batch) {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/semesters/active?department=${department}&batch=${batch}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return await handleResponse(response);
    } catch (error) {
      console.warn("Current semester API not available, using localStorage", error);
      // Fallback to localStorage
      try {
        const savedSemester = localStorage.getItem(`currentSemester-${department}-${batch}`);
        if (savedSemester) {
          return JSON.parse(savedSemester);
        }
      } catch (e) {
        console.error('Error reading from localStorage:', e);
      }
      return null;
    }
  }

  static async setCurrentSemester(department, batch, semesterData) {
    const token = getAuthToken();

    // Calculate the correct semester ID and name
    const semesterName = `${semesterData.level}-${semesterData.term}`;
    const semesterId = getSemesterIdFromLevelTerm(semesterData.level, semesterData.term);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/semesters/activate?department=${department}&batch=${batch}&semesterName=${semesterName}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return await handleResponse(response);
    } catch (error) {
      console.warn("Current semester API not available, using localStorage", error);
      // Fallback to localStorage
      try {
        localStorage.setItem(
          `currentSemester-${department}-${batch}`,
          JSON.stringify(semesterData)
        );
        return { success: true, message: 'Saved to localStorage' };
      } catch (e) {
        console.error('Error saving to localStorage:', e);
        throw new Error('Failed to save current semester');
      }
    }
  }

  // Course Management APIs
  static async saveCourse(courseData) {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.warn("Course API not implemented yet:", error);
      // Return mock response for now
      return {
        courseId: Date.now(),
        courseCode: courseData.courseCode,
        courseName: courseData.courseName,
        message: 'Course created successfully (mock)'
      };
    }
  }

  // Batch Course Creation API
  static async saveMultipleCourses(batchData) {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchData),
      });

      // Handle both success and error responses specially for batch creation
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`
        }));

        // If it's a 400 error with skipped courses info, throw a detailed error
        if (response.status === 400 && errorData.skippedCourses) {
          const error = new Error(errorData.error || 'Some courses could not be created');
          error.skippedCourses = errorData.skippedCourses;
          error.type = 'DUPLICATE_COURSES';
          throw error;
        }

        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Re-throw detailed errors as-is
      if (error.type === 'DUPLICATE_COURSES') {
        throw error;
      }

      console.warn("Batch Course API error:", error);
      throw error;
    }
  }

  static async deleteCourseByCode(courseCode) {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/courses/code/${courseCode}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return await handleResponse(response);
  }

  static async updateCourseByCode(courseCode, courseData) {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/courses/code/${courseCode}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(courseData)
    });

    return await handleResponse(response);
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

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid JSON response from server'));
          }
        } else {
          reject(new Error(`HTTP Error: ${xhr.status}`));
        }
      };

      xhr.onerror = function () {
        reject(new Error('Network error during file upload'));
      };

      xhr.open('POST', `${API_BASE_URL}/api/upload/file`);
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

  // Background image upload to S3
  static async uploadBackgroundImage(file) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        message: 'Background image uploaded successfully',
        fileUrl: `https://mock-s3-bucket.s3.amazonaws.com/backgrounds/${Date.now()}-${file.name}`,
        fileName: file.name
      };
    }

    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload/background`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    return await handleResponse(response);
  }

  // Resource file upload to S3
  static async uploadResourceFile(file, onProgress) {
    if (DEV_MODE) {
      // Simulate progress for development
      if (onProgress) {
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          onProgress(i);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        message: 'Resource file uploaded successfully',
        fileUrl: `https://mock-s3-bucket.s3.amazonaws.com/resources/${Date.now()}-${file.name}`,
        fileName: file.name,
        fileSize: file.size
      };
    }

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

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid JSON response from server'));
          }
        } else {
          reject(new Error(`HTTP Error: ${xhr.status}`));
        }
      };

      xhr.onerror = function () {
        reject(new Error('Network error during file upload'));
      };

      xhr.open('POST', `${API_BASE_URL}/api/upload/resource`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  }

  // Create resource with uploaded file
  static async createResourceWithFile(resourceData, file, onProgress) {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('title', resourceData.title);
    formData.append('description', resourceData.description || '');
    formData.append('resourceType', resourceData.resourceType);
    formData.append('courseCode', resourceData.courseCode);
    formData.append('semesterName', resourceData.semesterName);
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid JSON response from server'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error || `HTTP Error: ${xhr.status}`));
          } catch (e) {
            reject(new Error(`HTTP Error: ${xhr.status}`));
          }
        }
      };

      xhr.onerror = function () {
        reject(new Error('Network error during resource upload'));
      };

      xhr.open('POST', `${API_BASE_URL}/api/resources/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  }

  // Create resource with multiple files (folder mode)
  static async createResourceWithMultipleFiles(resourceData, files, onProgress) {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('title', resourceData.title);
    formData.append('description', resourceData.description || '');
    formData.append('resourceType', resourceData.resourceType);
    formData.append('courseCode', resourceData.courseCode);
    formData.append('semesterName', resourceData.semesterName);

    // Add all files to form data
    files.forEach((file, index) => {
      formData.append('files', file);
    });

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid JSON response from server'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error || `HTTP Error: ${xhr.status}`));
          } catch (e) {
            reject(new Error(`HTTP Error: ${xhr.status}`));
          }
        }
      };

      xhr.onerror = function () {
        reject(new Error('Network error during multiple file upload'));
      };

      xhr.open('POST', `${API_BASE_URL}/api/resources/upload/multiple`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  }

  // Add files to existing resource
  static async addFilesToResource(resourceId, files, onProgress) {
    const token = getAuthToken();
    const formData = new FormData();

    // Add all files to form data
    files.forEach((file, index) => {
      formData.append('files', file);
    });

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid JSON response from server'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error || `HTTP Error: ${xhr.status}`));
          } catch (e) {
            reject(new Error(`HTTP Error: ${xhr.status}`));
          }
        }
      };

      xhr.onerror = function () {
        reject(new Error('Network error during file addition'));
      };

      xhr.open('POST', `${API_BASE_URL}/api/resources/${resourceId}/files`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  }

  // Remove file from resource
  static async removeFileFromResource(resourceId, fileId) {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/resources/${resourceId}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }

    return await response.json();
  }

  // Update resource (title and description)
  static async updateResource(resourceId, resourceData) {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/resources/${resourceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resourceData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }

    return await response.json();
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

  // Get current user profile
  static async getCurrentUserProfile() {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        ...currentUser,
        profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName || 'User')}&background=3b82f6&color=ffffff&size=200`
      };
    }
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  }

  // Get profile image URL with caching
  static async getProfileImageUrl(userEmail) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Generate a consistent avatar URL for demo
      const user = mockUsers.find(u => u.email === userEmail);
      if (user) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=3b82f6&color=ffffff&size=200`;
      }
      return null;
    }

    // Use cache to prevent repeated API calls
    return profileCache.getOrFetchProfile(userEmail, async (email) => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/users/${email}/profile-picture`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const result = await handleResponse(response);
        return result.profilePicture;
      } catch (error) {
        console.error('Failed to get profile image URL:', error);
        // Fallback to getUserByEmail
        try {
          const userData = await this.getUserByEmail(email);
          if (userData && userData.profilePicture) {
            return userData.profilePicture;
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
        return null;
      }
    });
  }

  // Set test profile picture
  static async setTestProfilePicture(userEmail) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, message: 'Test profile picture set (dev mode)' };
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/users/${userEmail}/set-test-profile-picture`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const result = await handleResponse(response);

      // Clear cache for this user so the new profile picture is fetched
      profileCache.clearUserCache(userEmail);

      return result;
    } catch (error) {
      console.error('Failed to set test profile picture:', error);
      throw error;
    }
  }

  // Set test profile picture (for demo purposes)
  static async setTestProfilePicture(userEmail) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, message: 'Test profile picture set' };
    }

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/users/${userEmail}/set-test-profile-picture`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  }

  // ========== SAVED POSTS FUNCTIONALITY ==========

  // Save a post
  static async savePost(postId) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Mock successful save
      return { success: true, message: 'Post saved successfully (dev mode)' };
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Failed to save post:', error);
      throw error;
    }
  }

  // Unsave a post
  static async unsavePost(postId) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Mock successful unsave
      return { success: true, message: 'Post unsaved successfully (dev mode)' };
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/save`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Failed to unsave post:', error);
      throw error;
    }
  }

  // Get saved posts for current user
  static async getSavedPosts(page = 0, size = 10) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Mock saved posts using existing mock data
      const savedPosts = mockPosts.filter((_, index) => index % 3 === 0); // Every 3rd post is "saved"
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedPosts = savedPosts.slice(startIndex, endIndex);

      return {
        success: true,
        posts: paginatedPosts.map(post => ({ ...post, saved: true })),
        totalElements: savedPosts.length,
        totalPages: Math.ceil(savedPosts.length / size),
        currentPage: page,
        hasNext: endIndex < savedPosts.length,
        hasPrevious: page > 0
      };
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/posts/saved?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Failed to get saved posts:', error);
      throw error;
    }
  }

  // Department APIs
  static async getAllDepartments() {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        departments: {
          '01': 'Civil Engineering',
          '02': 'Electrical and Electronical Engineering',
          '03': 'Mechanical Engineering',
          '04': 'Computer Science & Engineering',
          '05': 'Urban & Regional Planning',
          '06': 'Architecture',
          '07': 'Petroleum & Mining Engineering',
          '08': 'Electronics & Telecommunication Engineering',
          '09': 'Mechatronics & Industrial Engineering',
          '10': 'Water Resources Engineering',
          '11': 'Biomedical Engineering',
          '12': 'Materials Science & Engineering',
        },
        departmentIds: {
          '01': 1,
          '02': 2,
          '03': 3,
          '04': 4,
          '05': 5,
          '06': 6,
          '07': 7,
          '08': 8,
          '09': 9,
          '10': 10,
          '11': 11,
          '12': 12,
        },
        total: 12
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/public/departments/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }

  // Get department name by code (no auth required)
  static async getDepartmentNameByCode(code) {
    if (DEV_MODE) {
      const departments = {
        '01': 'Civil Engineering',
        '02': 'Electrical and Electronical Engineering',
        '03': 'Mechanical Engineering',
        '04': 'Computer Science & Engineering',
        '05': 'Urban & Regional Planning',
        '06': 'Architecture',
        '07': 'Petroleum & Mining Engineering',
        '08': 'Electronics & Telecommunication Engineering',
        '09': 'Mechatronics & Industrial Engineering',
        '10': 'Water Resources Engineering',
        '11': 'Biomedical Engineering',
        '12': 'Materials Science & Engineering',
      };
      return {
        success: true,
        code: code,
        name: departments[code] || 'Unknown Department'
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/public/departments/code/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }

  static async getDepartmentCount() {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        count: 12
      };
    }

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/admin/departments/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }

  static async createDepartment(departmentData) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        id: Date.now(),
        code: departmentData.code,
        name: departmentData.name,
        message: 'Department created successfully'
      };
    }

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/admin/departments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(departmentData),
    });
    return handleResponse(response);
  }

  static async updateDepartment(deptId, departmentData) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        id: deptId,
        code: departmentData.code,
        name: departmentData.name,
        message: 'Department updated successfully'
      };
    }

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/admin/departments/${deptId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(departmentData),
    });
    return handleResponse(response);
  }

  static async deleteDepartment(deptId) {
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        message: 'Department deleted successfully'
      };
    }

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/admin/departments/${deptId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }
}

export default ApiService;
