import React from 'react';
import { useUser } from '../contexts/UserContext';

function AuthDebug() {
  const { isAuthenticated, user } = useUser();
  
  const userData = localStorage.getItem('user');
  const jwtToken = localStorage.getItem('jwt_token');
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h3 className="font-bold mb-2">Authentication Debug Info:</h3>
      <div className="space-y-2 text-sm">
        <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User Object:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
        <p><strong>LocalStorage 'user':</strong> {userData || 'null'}</p>
        <p><strong>LocalStorage 'jwt_token':</strong> {jwtToken || 'null'}</p>
      </div>
    </div>
  );
}

export default AuthDebug;