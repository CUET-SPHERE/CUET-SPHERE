import React, { useState, useEffect } from 'react';
import { Mail, Plus, Edit, Trash2, X, Save, Users, Search } from 'lucide-react';
import ApiService from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';

const CRManager = () => {
  const { user } = useUser();
  const { isDark, colors } = useTheme();
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
      <div
        className="p-6 rounded-xl shadow-md border lg:col-span-2"
        style={{
          backgroundColor: isDark ? colors.background.cardDark : colors.background.cardLight,
          borderColor: isDark ? colors.interactive.borderDark : colors.interactive.border
        }}
      >
        <div className="animate-pulse">
          <div
            className="h-6 rounded w-1/3 mb-4"
            style={{ backgroundColor: isDark ? colors.interactive.hoverDark : colors.interactive.hover }}
          ></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-12 rounded"
                style={{ backgroundColor: isDark ? colors.interactive.hoverDark : colors.interactive.hover }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-xl shadow-md border lg:col-span-2"
      style={{
        backgroundColor: isDark ? colors.background.cardDark : colors.background.cardLight,
        borderColor: isDark ? colors.interactive.borderDark : colors.interactive.border
      }}
    >
      <h2
        className="text-xl font-semibold mb-4 flex items-center gap-2"
        style={{ color: isDark ? colors.text.primaryDark : colors.text.primaryLight }}
      >
        <Users style={{ color: colors.primary.blue }} />
        Manage CR Assignments
      </h2>

      {error && (
        <div
          className="mb-4 p-3 border rounded-lg"
          style={{
            backgroundColor: isDark ? colors.status.error.dark : colors.status.error.light,
            borderColor: isDark ? colors.status.error.darkText : colors.status.error.lightText,
            color: isDark ? colors.status.error.darkText : colors.status.error.lightText
          }}
        >
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight }}
              />
              <input
                type="text"
                placeholder="Search by name, email, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                style={{
                  backgroundColor: isDark ? colors.interactive.hoverDark : colors.interactive.hover,
                  borderColor: isDark ? colors.interactive.borderDark : colors.interactive.border,
                  color: isDark ? colors.text.primaryDark : colors.text.primaryLight,
                  focusRingColor: colors.primary.blue,
                  focusBorderColor: colors.primary.blue
                }}
              />
            </div>
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
            style={{
              backgroundColor: isDark ? colors.interactive.hoverDark : colors.interactive.hover,
              borderColor: isDark ? colors.interactive.borderDark : colors.interactive.border,
              color: isDark ? colors.text.primaryDark : colors.text.primaryLight,
              focusRingColor: colors.primary.blue,
              focusBorderColor: colors.primary.blue
            }}
          >
            <option value="">All Departments</option>
            {getDepartments().map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
            style={{
              backgroundColor: isDark ? colors.interactive.hoverDark : colors.interactive.hover,
              borderColor: isDark ? colors.interactive.borderDark : colors.interactive.border,
              color: isDark ? colors.text.primaryDark : colors.text.primaryLight,
              focusRingColor: colors.primary.blue,
              focusBorderColor: colors.primary.blue
            }}
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
          <div
            className="text-center py-8"
            style={{ color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight }}
          >
            {loading ? 'Loading users...' : 'No users found matching your criteria.'}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ backgroundColor: isDark ? colors.status.general.dark : colors.status.general.light }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: isDark ? colors.status.academic.dark : colors.status.academic.light
                      }}
                    >
                      <span
                        className="font-semibold text-sm"
                        style={{
                          color: isDark ? colors.status.academic.darkText : colors.status.academic.lightText
                        }}
                      >
                        {user.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: isDark ? colors.text.primaryDark : colors.text.primaryLight }}
                    >
                      {user.fullName}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight }}
                    >
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: isDark ? colors.status.academic.dark : colors.status.academic.light,
                          color: isDark ? colors.status.academic.darkText : colors.status.academic.lightText
                        }}
                      >
                        {user.department}
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: isDark ? colors.status.event.dark : colors.status.event.light,
                          color: isDark ? colors.status.event.darkText : colors.status.event.lightText
                        }}
                      >
                        {user.batch}
                      </span>
                      {user.role === 'CR' && (
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: isDark ? colors.status.urgent.dark : colors.status.urgent.light,
                            color: isDark ? colors.status.urgent.darkText : colors.status.urgent.lightText
                          }}
                        >
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
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors"
                    style={{
                      backgroundColor: isDark ? colors.status.error.dark : colors.status.error.light,
                      color: isDark ? colors.status.error.darkText : colors.status.error.lightText
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = colors.status.error.lightText;
                      e.target.style.color = colors.text.primaryDark;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = isDark ? colors.status.error.dark : colors.status.error.light;
                      e.target.style.color = isDark ? colors.status.error.darkText : colors.status.error.lightText;
                    }}
                  >
                    Remove CR
                  </button>
                ) : (
                  <button
                    onClick={() => handleAssignCR(user.email)}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors"
                    style={{
                      backgroundColor: colors.primary.blueLight,
                      color: colors.primary.blueDark
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = colors.primary.blue;
                      e.target.style.color = colors.text.primaryDark;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = colors.primary.blueLight;
                      e.target.style.color = colors.primary.blueDark;
                    }}
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
      <div
        className="mt-6 pt-4 border-t"
        style={{ borderColor: isDark ? colors.interactive.borderDark : colors.interactive.border }}
      >
        <div
          className="flex justify-between text-sm"
          style={{ color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight }}
        >
          <span>Total Users: {filteredUsers.length}</span>
          <span>CR Users: {filteredUsers.filter(u => u.role === 'CR').length}</span>
        </div>
      </div>
    </div>
  );
};

export default CRManager;
