import React, { useState, useEffect } from 'react';
import { Mail, Plus, Edit, Trash2, X, Save, Users, Search } from 'lucide-react';
import ApiService from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const CRManager = () => {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedDepartment, selectedBatch]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAllUsers();
      setUsers(response);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.studentId?.includes(searchTerm)
      );
    }

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(user => user.department === selectedDepartment);
    }

    // Filter by batch
    if (selectedBatch) {
      filtered = filtered.filter(user => user.batch === selectedBatch);
    }

    setFilteredUsers(filtered);
  };

  const handleAssignCR = async (userEmail) => {
    try {
      setError('');
      const request = {
        userEmail: userEmail,
        department: users.find(u => u.email === userEmail)?.department,
        batch: users.find(u => u.email === userEmail)?.batch
      };
      
      const response = await ApiService.assignCrRole(request);
      
      if (response.success) {
        // Reload users to get updated data
        await loadUsers();
      } else {
        setError(response.message || 'Failed to assign CR role.');
      }
    } catch (error) {
      console.error('Error assigning CR role:', error);
      setError(error.message || 'Failed to assign CR role.');
    }
  };

  const handleRemoveCR = async (userEmail) => {
    try {
      setError('');
      const response = await ApiService.removeCrRole(userEmail);
      
      if (response.success) {
        // Reload users to get updated data
        await loadUsers();
      } else {
        setError(response.message || 'Failed to remove CR role.');
      }
    } catch (error) {
      console.error('Error removing CR role:', error);
      setError(error.message || 'Failed to remove CR role.');
    }
  };

  const getDepartments = () => {
    const departments = [...new Set(users.map(user => user.department).filter(Boolean))];
    return departments.sort();
  };

  const getBatches = () => {
    const batches = [...new Set(users.map(user => user.batch).filter(Boolean))];
    return batches.sort();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 lg:col-span-2">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 lg:col-span-2">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Users className="text-pink-500" />
        Manage CR Assignments
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, email, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="">All Departments</option>
            {getDepartments().map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="">All Batches</option>
            {getBatches().map(batch => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {loading ? 'Loading users...' : 'No users found matching your criteria.'}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                      <span className="text-pink-600 dark:text-pink-400 font-semibold text-sm">
                        {user.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {user.department}
                      </span>
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                        {user.batch}
                      </span>
                      {user.role === 'CR' && (
                        <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 px-2 py-1 rounded">
                          CR
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {user.role === 'CR' ? (
                  <button
                    onClick={() => handleRemoveCR(user.email)}
                    className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    Remove CR
                  </button>
                ) : (
                  <button
                    onClick={() => handleAssignCR(user.email)}
                    className="px-3 py-1.5 text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
                  >
                    Assign CR
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Total Users: {filteredUsers.length}</span>
          <span>CR Users: {filteredUsers.filter(u => u.role === 'CR').length}</span>
        </div>
      </div>
    </div>
  );
};

export default CRManager;
