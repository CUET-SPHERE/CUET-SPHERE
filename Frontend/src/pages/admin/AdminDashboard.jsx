import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Building, Home, Trash2, BarChart2, Users, Shield } from 'lucide-react';
import DepartmentManager from '../../components/admin/DepartmentManager';
import HallManager from '../../components/admin/HallManager';
import CRManager from '../../components/admin/CRManager';
import ApiService from '../../services/api';

const StatCard = ({ title, value, icon, iconColor, loading = false }) => {
  const { colors } = useTheme();
  const Icon = icon;
  return (
    <div className={`p-6 rounded-xl shadow-md border flex items-center gap-4 ${colors.background.surface} border-gray-200 dark:border-gray-700`}>
      <div
        className="p-3 rounded-full"
        style={{ backgroundColor: iconColor }}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className={`text-sm ${colors.text.secondary}`}>
          {title}
        </p>
        {loading ? (
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ) : (
          <p className={`text-2xl font-bold ${colors.text.primary}`}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, postDeleteCount } = useUser();
  const { colors } = useTheme();
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
      const [users, departmentCountResponse] = await Promise.all([
        ApiService.getAllUsers(),
        ApiService.getDepartmentCount()
      ]);

      const halls = [...new Set(users.map(user => user.hall).filter(Boolean))];
      const crs = users.filter(user => user.role === 'CR');

      setStats({
        totalUsers: users.length,
        totalCRs: crs.length,
        totalDepartments: departmentCountResponse.count || 0,
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
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${colors.background.main}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className={`text-3xl font-bold ${colors.text.primary}`}>
            Admin Dashboard
          </h1>
          <p className={`mt-1 ${colors.text.secondary}`}>
            Welcome, {user?.fullName || 'Admin'}. Manage the platform from here.
          </p>
          {error && (
            <div className="mt-4 p-3 border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            iconColor="#2563eb" // Blue-600
            loading={loading}
          />
          <StatCard
            title="CR Users"
            value={stats.totalCRs}
            icon={Shield}
            iconColor="#dc2626" // Red-600
            loading={loading}
          />
          <StatCard
            title="Departments"
            value={stats.totalDepartments}
            icon={Building}
            iconColor="#16a34a" // Green-600
            loading={loading}
          />
          <StatCard
            title="Halls"
            value={stats.totalHalls}
            icon={Home}
            iconColor="#7c3aed" // Purple-600
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
