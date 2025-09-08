import React, { useState } from 'react';
import { authService } from '../services/authService';

function QuickLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.signin(email, password);
      onLoginSuccess && onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authService.isAuthenticated()) {
    const userInfo = authService.getUserInfo();
    return (
      <div className="p-4 bg-green-100 rounded-lg">
        <p className="text-green-800">Logged in as: {userInfo?.fullName} ({userInfo?.email})</p>
        <button 
          onClick={() => authService.logout()} 
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Quick Login for Testing</h3>
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          placeholder="Email (e.g., test2021@student.cuet.ac.bd)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}

export default QuickLogin;