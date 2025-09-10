import React, { useState } from 'react';
import EmailService from '../services/emailService';

const BrevoTestComponent = () => {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testBrevoAPI = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Test the password reset email
      const emailResult = await EmailService.sendPasswordResetEmail(testEmail, '123456');
      setResult({
        success: true,
        message: 'Email sent successfully!',
        details: emailResult
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Email failed to send',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setLoading(true);
    setResult(null);

    const apiKey = import.meta.env.VITE_BREVO_API_KEY;
    const senderEmail = import.meta.env.VITE_BREVO_SENDER_EMAIL;

    if (!apiKey || !senderEmail) {
      setResult({
        success: false,
        message: 'Brevo credentials not configured in .env file'
      });
      setLoading(false);
      return;
    }

    const emailData = {
      sender: {
        name: 'CUET Sphere Test',
        email: senderEmail
      },
      to: [{
        email: testEmail,
        name: 'Test User'
      }],
      subject: 'Direct Brevo API Test',
      htmlContent: `
        <h2>🎓 Brevo API Test</h2>
        <p>This is a direct test of the Brevo API.</p>
        <p>If you receive this email, your Brevo integration is working correctly!</p>
        <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
      `
    };

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const responseData = await response.json();
      setResult({
        success: true,
        message: 'Direct API call successful!',
        details: responseData
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Direct API call failed',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        🧪 Brevo Email Test
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Test Email Address
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email to test"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={testBrevoAPI}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Test via EmailService'}
          </button>
          
          <button
            onClick={testDirectAPI}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Test Direct API Call'}
          </button>
        </div>

        {result && (
          <div className={`p-3 rounded-md ${result.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
            <p className={`font-medium ${result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
              {result.message}
            </p>
            {result.error && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Error: {result.error}
              </p>
            )}
            {result.details && (
              <pre className="text-xs mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded overflow-auto">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p><strong>Current Config:</strong></p>
          <p>API Key: {import.meta.env.VITE_BREVO_API_KEY ? '✅ Set' : '❌ Missing'}</p>
          <p>Sender Email: {import.meta.env.VITE_BREVO_SENDER_EMAIL || '❌ Missing'}</p>
        </div>
      </div>
    </div>
  );
};

export default BrevoTestComponent;