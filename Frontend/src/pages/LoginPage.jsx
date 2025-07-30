import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Eye, EyeOff } from "lucide-react";
import { validateLoginForm } from "../utils/validation";
import { useUser } from "../contexts/UserContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock authentication for multiple users
      const mockUsers = {
        'rony@student.cuet.ac.bd': {
          password: 'rony123',
          userData: {
            fullName: 'Muhammad Rony',
            studentId: '2204005',
            email: 'rony@student.cuet.ac.bd',
            batch: '2022-2023',
            department: 'CSE',
            hall: 'Bangabandhu Sheikh Mujibur Rahman Hall',
            role: 'student',
          },
        },
        'cr@student.cuet.ac.bd': {
          password: 'cr123',
          userData: {
            fullName: 'CR User',
            studentId: '2204001',
            email: 'cr@student.cuet.ac.bd',
            batch: '2022-2023',
            department: 'CSE',
            hall: 'Bangabandhu Sheikh Mujibur Rahman Hall',
            role: 'cr',
          },
        },
        'admin@student.cuet.ac.bd': {
          password: 'admin123',
          userData: {
            fullName: 'Admin User',
            studentId: '0000000',
            email: 'admin@student.cuet.ac.bd',
            batch: 'N/A',
            department: 'System',
            hall: 'N/A',
            role: 'admin',
          },
        },
      };

      const user = mockUsers[formData.email];

      if (user && user.password === formData.password) {
        login(user.userData);
        navigate('/dashboard');
      } else {
        // Invalid credentials
        setErrors({ submit: "Invalid email or password. Please try again." });
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ submit: "Invalid email or password. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your CUET Connect account
          </p>
        </div>

        {/* Login Credentials Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Test Login Credentials:
          </h3>
          <div className="text-xs text-blue-600 dark:text-blue-300 space-y-2">
            <div>
              <p><strong>Role:</strong> Student</p>
              <p><strong>Email:</strong> rony@student.cuet.ac.bd</p>
              <p><strong>Password:</strong> rony123</p>
            </div>
            <div>
              <p><strong>Role:</strong> CR</p>
              <p><strong>Email:</strong> cr@student.cuet.ac.bd</p>
              <p><strong>Password:</strong> cr123</p>
            </div>
            <div>
              <p><strong>Role:</strong> Admin</p>
              <p><strong>Email:</strong> admin@student.cuet.ac.bd</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="text-red-600 text-sm text-center">
              {errors.submit}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 transform hover:scale-105"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
