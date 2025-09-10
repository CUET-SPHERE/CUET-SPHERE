import React, { useState } from 'react';
import ApiService from '../services/api';

const TestForgotPassword = () => {
  const [email, setEmail] = useState('test@student.cuet.ac.bd');
  const [otp, setOtp] = useState('123456');
  const [newPassword, setNewPassword] = useState('newPassword123');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testRequestReset = async () => {
    setLoading(prev => ({ ...prev, request: true }));
    try {
      const result = await ApiService.requestPasswordReset(email);
      setResults(prev => ({ ...prev, request: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, request: { error: error.message } }));
    }
    setLoading(prev => ({ ...prev, request: false }));
  };

  const testVerifyOtp = async () => {
    setLoading(prev => ({ ...prev, verify: true }));
    try {
      const result = await ApiService.verifyOtp(email, otp);
      setResults(prev => ({ ...prev, verify: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, verify: { error: error.message } }));
    }
    setLoading(prev => ({ ...prev, verify: false }));
  };

  const testResetPassword = async () => {
    setLoading(prev => ({ ...prev, reset: true }));
    try {
      const result = await ApiService.resetPassword({
        email,
        resetToken: 'mock-token',
        newPassword
      });
      setResults(prev => ({ ...prev, reset: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, reset: { error: error.message } }));
    }
    setLoading(prev => ({ ...prev, reset: false }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Test Forgot Password Flow
      </h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            OTP (use 123456 for testing)
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={testRequestReset}
            disabled={loading.request}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.request ? 'Sending...' : '1. Request Reset'}
          </button>
          
          <button
            onClick={testVerifyOtp}
            disabled={loading.verify}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading.verify ? 'Verifying...' : '2. Verify OTP'}
          </button>
          
          <button
            onClick={testResetPassword}
            disabled={loading.reset}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading.reset ? 'Resetting...' : '3. Reset Password'}
          </button>
        </div>

        <div className="space-y-2">
          {Object.entries(results).map(([key, result]) => (
            <div key={key} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
              <strong className="text-gray-900 dark:text-white">{key}:</strong>
              <pre className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestForgotPassword;