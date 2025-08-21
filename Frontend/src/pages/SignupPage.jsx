import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Mail, Hash, Eye, EyeOff, Lock, Users, Building } from 'lucide-react';
import { validateSignupForm, extractBatch, extractDepartment, HALLS, BOYS_HALLS, GIRLS_HALLS, GENDERS } from '../utils/validation';
import { useUser } from '../contexts/UserContext';
import ApiService from '../services/api';

// --- Component Definitions Moved Outside ---
// This prevents them from being re-created on every render, fixing the focus loss issue.

const InputField = ({ id, name, label, type, value, onChange, error, placeholder, icon, maxLength, required = true }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
      <input id={id} name={name} type={type} required={required} value={value} onChange={onChange} maxLength={maxLength}
        className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7FFF] focus:border-[#9E7FFF] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'}`}
        placeholder={placeholder} />
    </div>
    {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>
);

const SelectField = ({ id, name, label, value, onChange, error, icon, children, required = true }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
      <select id={id} name={name} required={required} value={value} onChange={onChange}
        className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7FFF] focus:border-[#9E7FFF] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'}`}>
        {children}
      </select>
    </div>
    {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>
);


const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    hall: '',
    bio: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Create updated form data
    const updatedFormData = { ...formData, [name]: value };
    
    setFormData(updatedFormData);
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const validationErrors = validateSignupForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    const { confirmPassword, ...signupData } = formData;

    try {
      const response = await ApiService.signup(signupData);
      
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

        login(userData);
        navigate('/dashboard');
      } else {
        setErrors({ submit: response.message || 'Signup failed. Please try again.' });
      }
    } catch (error) {
      console.error('Signup API error:', error);
      setErrors({ submit: error.message || 'Could not connect to the server. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* --- Increased horizontal space from max-w-md to max-w-2xl --- */}
      <div className="max-w-2xl w-full space-y-6 p-8 md:p-10 bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-[#9E7FFF]" />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">Join CUET Sphere</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Create your account to connect with the community.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField id="fullName" name="fullName" label="Full Name" type="text" value={formData.fullName} onChange={handleInputChange} error={errors.fullName} placeholder="Enter your full name" icon={<User className="h-5 w-5 text-gray-400" />} />
          </div>

          <InputField id="email" name="email" label="Email Address" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} placeholder="you@student.cuet.ac.bd" icon={<Mail className="h-5 w-5 text-gray-400" />} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField id="hall" name="hall" label="Hall" value={formData.hall} onChange={handleInputChange} error={errors.hall} icon={<Building className="h-5 w-5 text-gray-400" />}>
              <option value="">Select your hall</option>
              {HALLS.map((hall) => <option key={hall} value={hall}>{hall}</option>)}
            </SelectField>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio (Optional)</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7FFF] focus:border-[#9E7FFF] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7FFF] focus:border-[#9E7FFF] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'}`}
                  placeholder="Create a password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleInputChange}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7FFF] focus:border-[#9E7FFF] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'}`}
                  placeholder="Confirm your password" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
            </div>
          </div>

          {errors.submit && <div className="text-red-600 dark:text-red-400 text-sm text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">{errors.submit}</div>}

          <div>
            <button type="submit" disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9E7FFF] transition-all duration-200 ${isSubmitting ? 'bg-[#BFB0FF] cursor-not-allowed' : 'bg-[#9E7FFF] hover:bg-[#8A6AE3] transform hover:scale-105'}`}>
              {isSubmitting ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>Creating Account...</>
              ) : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
