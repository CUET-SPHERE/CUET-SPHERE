import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Upload, 
  Settings, 
  Bell, 
  Plus, 
  Edit3, 
  Trash2,
  Shield,
  UserCheck,
  UserX,
  MessageSquare,
  Calendar,
  BookOpen
} from 'lucide-react';
import ApiService from '../services/api';

const AdminCRFeatures = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState([]);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    if (user?.role === 'SYSTEM_ADMIN') {
      loadUsers();
    }
    if (user?.role === 'CR' || user?.role === 'SYSTEM_ADMIN') {
      loadNotices();
      loadResources();
    }
  }, [user]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getAllUsers();
      setUsers(response);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotices = async () => {
    try {
      const response = await ApiService.getAllNotices();
      setNotices(response || []);
    } catch (error) {
      console.error('Error loading notices:', error);
    }
  };

  const loadResources = async () => {
    try {
      const response = await ApiService.getAllResources();
      setResources(response || []);
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  const handleAssignCR = async (userEmail) => {
    try {
      // Find the user to get their department and batch
      const user = users.find(u => u.email === userEmail);
      if (!user) {
        console.error('User not found in local list:', userEmail);
        return;
      }
      
      const request = {
        userEmail: userEmail,
        department: user.department,
        batch: user.batch
      };
      
      await ApiService.assignCrRole(request);
      loadUsers(); // Reload users
    } catch (error) {
      console.error('Error assigning CR role:', error);
    }
  };

  const handleRemoveCR = async (userEmail) => {
    try {
      await ApiService.removeCrRole(userEmail);
      loadUsers(); // Reload users
    } catch (error) {
      console.error('Error removing CR role:', error);
    }
  };

  // Admin Dashboard Component
  const AdminDashboard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Panel</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.role === 'CR').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">CR Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{notices.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Notices</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white">Recent Users</h4>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    user.role === 'CR' ? 'bg-yellow-100 text-yellow-800' :
                    user.role === 'SYSTEM_ADMIN' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex gap-2">
                  {user.role === 'STUDENT' && (
                    <button
                      onClick={() => handleAssignCR(user.email)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                      title="Assign CR Role"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                  )}
                  {user.role === 'CR' && (
                    <button
                      onClick={() => handleRemoveCR(user.email)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      title="Remove CR Role"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // CR Dashboard Component
  const CRDashboard = () => {
    const navigateToMyGroup = () => {
      // Navigate to My Group page for creating notices
      window.location.href = '/my-group';
    };

    const navigateToResources = () => {
      // Navigate to Resources page for uploading resources
      window.location.href = '/resources';
    };

    const openMessageModal = () => {
      // TODO: Implement message modal
      alert('Message functionality coming soon!');
    };

    const openEventModal = () => {
      // TODO: Implement event scheduling modal
      alert('Event scheduling functionality coming soon!');
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserCheck className="h-6 w-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">CR Panel</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{notices.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Notices Created</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{resources.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resources Shared</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">Quick Actions</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button 
              onClick={navigateToMyGroup}
              className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
            >
              <Plus className="h-5 w-5 text-blue-500" />
              <span className="text-gray-900 dark:text-white">Create Notice</span>
            </button>
            
            <button 
              onClick={navigateToResources}
              className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
            >
              <Upload className="h-5 w-5 text-green-500" />
              <span className="text-gray-900 dark:text-white">Upload Resource</span>
            </button>
            
            <button 
              onClick={openMessageModal}
              className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
            >
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <span className="text-gray-900 dark:text-white">Send Message</span>
            </button>
            
            <button 
              onClick={openEventModal}
              className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer"
            >
              <Calendar className="h-5 w-5 text-orange-500" />
              <span className="text-gray-900 dark:text-white">Schedule Event</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Don't render if user is not admin or CR
  if (!user || (user.role !== 'SYSTEM_ADMIN' && user.role !== 'CR')) {
    return null;
  }

  return (
    <div className="space-y-6">
      {user.role === 'SYSTEM_ADMIN' && <AdminDashboard />}
      {user.role === 'CR' && <CRDashboard />}
    </div>
  );
};

export default AdminCRFeatures;
