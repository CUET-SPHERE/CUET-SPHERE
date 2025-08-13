import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { Building, Home, Trash2, BarChart2 } from 'lucide-react';
import DepartmentManager from '../../components/admin/DepartmentManager';
import HallManager from '../../components/admin/HallManager';
import CRManager from '../../components/admin/CRManager';

const StatCard = ({ title, value, icon, color }) => {
  const Icon = icon;
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, postDeleteCount } = useUser();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Welcome, {user?.fullName || 'Admin'}. Manage the platform from here.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Departments" value="12" icon={Building} color="bg-blue-500" />
          <StatCard title="Total Halls" value="9" icon={Home} color="bg-green-500" />
          <StatCard title="Posts Deleted by Admin" value={postDeleteCount} icon={Trash2} color="bg-red-500" />
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
