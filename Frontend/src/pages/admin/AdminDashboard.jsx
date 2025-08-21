import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { Building, Home, Trash2, BarChart2, Users, Shield } from 'lucide-react';
import DepartmentManager from '../../components/admin/DepartmentManager';
import HallManager from '../../components/admin/HallManager';
import CRManager from '../../components/admin/CRManager';
import ApiService from '../../services/api';

const StatCard = ({ title, value, icon, color, loading = false }) => {
  const Icon = icon;
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        {loading ? (
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ) : (
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, postDeleteCount } = useUser();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCRs: 0,
    totalDepartments: 0,
    totalHalls: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const users = await ApiService.getAllUsers();
      
      const departments = [...new Set(users.map(user => user.department).filter(Boolean))];
      const halls = [...new Set(users.map(user => user.hall).filter(Boolean))];
      const crs = users.filter(user => user.role === 'CR');
      
      setStats({
        totalUsers: users.length,
        totalCRs: crs.length,
        totalDepartments: departments.length,
        totalHalls: halls.length
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Welcome, {user?.fullName || 'Admin'}. Manage the platform from here.
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={Users} 
            color="bg-blue-500" 
            loading={loading}
          />
          <StatCard 
            title="CR Users" 
            value={stats.totalCRs} 
            icon={Shield} 
            color="bg-pink-500" 
            loading={loading}
          />
          <StatCard 
            title="Departments" 
            value={stats.totalDepartments} 
            icon={Building} 
            color="bg-green-500" 
            loading={loading}
          />
          <StatCard 
            title="Halls" 
            value={stats.totalHalls} 
            icon={Home} 
            color="bg-purple-500" 
            loading={loading}
          />
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DepartmentManager />
          <HallManager />
          <CRManager />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
