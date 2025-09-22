import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Eye, EyeOff } from "lucide-react";
import { validateLoginForm } from "../utils/validation";
import { useUser } from "../contexts/UserContext";
import ApiService from "../services/api";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import { useTheme } from "../contexts/ThemeContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const themeContext = useTheme();
  const { colors = {}, buttonClasses = {} } = themeContext || {};

  // Fallback colors
  const primaryText = colors?.primary?.text || 'text-blue-600';
  const primaryButton = buttonClasses?.primary || 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors';
  const focusColor = colors?.interactive?.focus || '#2563eb';
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
    setErrors({});

    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await ApiService.signin(formData);

      console.log('Backend response:', response);

      if (response.success) {
        // Transform the response to match frontend expectations
        const userData = {
          fullName: response.fullName,
          email: response.email,
          role: response.role,
          token: response.token,
          // Add other fields that might be needed
          studentId: response.studentId || '',
          batch: response.batch || '',
          department: response.department || '',
          hall: response.hall || '',
          bio: response.bio || '',
        };

        console.log('Transformed userData:', userData);

        login(userData);

        // Redirect based on role
        if (response.role === 'SYSTEM_ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/feed');
        }
      } else {
        setErrors({ submit: response.message || "Login failed. Please try again." });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ submit: error.message || "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <GraduationCap className={`mx-auto h-12 w-12 ${primaryText}`} />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your CUET Sphere account
          </p>
        </div>



        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[${focusColor}] focus:border-[${focusColor}] dark:bg-gray-800 dark:border-gray-600 dark:text-white ${errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

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
                  className={`block w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[${focusColor}] focus:border-[${focusColor}] dark:bg-gray-800 dark:border-gray-600 dark:text-white ${errors.password ? "border-red-500" : "border-gray-300"
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
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className={`text-sm ${primaryText} hover:${primaryText}/80 transition-colors duration-200`}
                >
                  Forgot Password?
                </button>
              </div>
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
              className={`${primaryButton} group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                className={`font-medium ${primaryText} hover:${primaryText}/80 transition-colors duration-200`}
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
};

export default LoginPage;
