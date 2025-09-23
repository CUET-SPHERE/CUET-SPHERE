import React, { useState, useEffect } from 'react';
import { Building, Plus, Edit, Trash2, X, Save, Loader } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ApiService from '../../services/api';

const DepartmentManager = () => {
  const { isDark, colors } = useTheme();
  const [departments, setDepartments] = useState({});
  const [departmentIds, setDepartmentIds] = useState({}); // Map code to database ID
  const [newDept, setNewDept] = useState({ code: '', name: '' });
  const [editing, setEditing] = useState(null); // { code, name, id }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ApiService.getAllDepartments();
      
      if (response.success !== false) {
        setDepartments(response.departments || {});
        // Store department IDs if available
        if (response.departmentIds) {
          setDepartmentIds(response.departmentIds);
        }
      } else {
        setError(response.error || 'Failed to load departments');
      }
    } catch (err) {
      console.error('Error loading departments:', err);
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newDept.code || !newDept.name || departments[newDept.code]) {
      setError('Please provide a valid code and name. Code must be unique.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const response = await ApiService.createDepartment({
        code: newDept.code,
        name: newDept.name
      });

      if (response.success) {
        // Update local state
        setDepartments({ ...departments, [newDept.code]: newDept.name });
        if (response.id) {
          setDepartmentIds({ ...departmentIds, [newDept.code]: response.id });
        }
        setNewDept({ code: '', name: '' });
        // Reload to ensure consistency
        loadDepartments();
      } else {
        setError(response.error || 'Failed to create department');
      }
    } catch (err) {
      console.error('Error creating department:', err);
      setError('Failed to create department');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code) => {
    const deptId = departmentIds[code];
    if (!deptId) {
      setError('Cannot delete: Department ID not found');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${departments[code]}?`)) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const response = await ApiService.deleteDepartment(deptId);

      if (response.success) {
        // Update local state
        const updatedDepts = { ...departments };
        const updatedIds = { ...departmentIds };
        delete updatedDepts[code];
        delete updatedIds[code];
        setDepartments(updatedDepts);
        setDepartmentIds(updatedIds);
      } else {
        setError(response.error || 'Failed to delete department');
      }
    } catch (err) {
      console.error('Error deleting department:', err);
      setError('Failed to delete department');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editing || !editing.code || !editing.name) {
      setError('Please provide a valid name');
      return;
    }

    const deptId = departmentIds[editing.code] || editing.id;
    if (!deptId) {
      setError('Cannot update: Department ID not found');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const response = await ApiService.updateDepartment(deptId, {
        code: editing.code,
        name: editing.name
      });

      if (response.success) {
        // Update local state
        setDepartments({ ...departments, [editing.code]: editing.name });
        setEditing(null);
        // Reload to ensure consistency
        loadDepartments();
      } else {
        setError(response.error || 'Failed to update department');
      }
    } catch (err) {
      console.error('Error updating department:', err);
      setError('Failed to update department');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow-md border ${colors.background.surface} border-gray-200 dark:border-gray-700`}>
      <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${colors.text.primary}`}>
        <Building className="text-blue-600" />
        Manage Departments
        {loading && <Loader className="animate-spin" size={16} />}
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin text-blue-600" size={24} />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading departments...</span>
        </div>
      ) : (
        <>
          {/* List */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {Object.entries(departments).length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No departments found
              </div>
            ) : (
              Object.entries(departments).map(([code, name]) => (
                <div
                  key={code}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: isDark ? colors.status.general.dark : colors.status.general.light }}
                >
                  {editing?.code === code ? (
                    <input
                      type="text"
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      className="bg-transparent w-full focus:outline-none"
                      style={{ color: isDark ? colors.text.primaryDark : colors.text.primaryLight }}
                      disabled={saving}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <span
                        className="font-mono text-sm px-2 py-1 rounded"
                        style={{
                          backgroundColor: isDark ? colors.interactive.hoverDark : colors.interactive.hover,
                          color: isDark ? colors.text.primaryDark : colors.text.primaryLight
                        }}
                      >
                        {code}
                      </span>
                      <span
                        style={{ color: isDark ? colors.text.primaryDark : colors.text.primaryLight }}
                      >
                        {name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {editing?.code === code ? (
                      <>
                        <button
                          onClick={handleEdit}
                          disabled={saving}
                          className="p-1.5 rounded-full transition-colors disabled:opacity-50"
                          style={{
                            color: isDark ? colors.status.success.darkText : colors.status.success.lightText,
                          }}
                          onMouseEnter={(e) => {
                            if (!saving) {
                              e.target.style.backgroundColor = isDark ? colors.status.success.dark : colors.status.success.light;
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                          }}
                        >
                          {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          disabled={saving}
                          className="p-1.5 rounded-full transition-colors disabled:opacity-50"
                          style={{
                            color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight,
                          }}
                          onMouseEnter={(e) => {
                            if (!saving) {
                              e.target.style.backgroundColor = isDark ? colors.interactive.hoverDark : colors.interactive.hover;
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                          }}
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditing({ code, name, id: departmentIds[code] })}
                          disabled={saving}
                          className="p-1.5 rounded-full transition-colors disabled:opacity-50"
                          style={{
                            color: colors.primary.blue,
                          }}
                          onMouseEnter={(e) => {
                            if (!saving) {
                              e.target.style.backgroundColor = colors.primary.blueLight;
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(code)}
                          disabled={saving}
                          className="p-1.5 rounded-full transition-colors disabled:opacity-50"
                          style={{
                            color: isDark ? colors.status.error.darkText : colors.status.error.lightText,
                          }}
                          onMouseEnter={(e) => {
                            if (!saving) {
                              e.target.style.backgroundColor = isDark ? colors.status.error.dark : colors.status.error.light;
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Form */}
          <div
            className="mt-6 pt-4 border-t"
            style={{ borderColor: isDark ? colors.interactive.borderDark : colors.interactive.border }}
          >
            <h3
              className="text-md font-semibold mb-2"
              style={{ color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight }}
            >
              Add New Department
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Code (e.g., 13)"
                value={newDept.code}
                onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                disabled={saving}
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:outline-none disabled:opacity-50"
                style={{
                  backgroundColor: isDark ? colors.interactive.hoverDark : colors.interactive.hover,
                  borderColor: isDark ? colors.interactive.borderDark : colors.interactive.border,
                  color: isDark ? colors.text.primaryDark : colors.text.primaryLight,
                  focusRingColor: colors.primary.blue,
                  focusBorderColor: colors.primary.blue
                }}
              />
              <input
                type="text"
                placeholder="Department Name"
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                disabled={saving}
                className="flex-grow p-2 border rounded-lg focus:ring-2 focus:outline-none disabled:opacity-50"
                style={{
                  backgroundColor: isDark ? colors.interactive.hoverDark : colors.interactive.hover,
                  borderColor: isDark ? colors.interactive.borderDark : colors.interactive.border,
                  color: isDark ? colors.text.primaryDark : colors.text.primaryLight,
                  focusRingColor: colors.primary.blue,
                  focusBorderColor: colors.primary.blue
                }}
              />
              <button
                onClick={handleAdd}
                disabled={saving || !newDept.code || !newDept.name}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: colors.primary.blue,
                  color: colors.text.primaryDark
                }}
                onMouseEnter={(e) => {
                  if (!saving && newDept.code && newDept.name) {
                    e.target.style.backgroundColor = colors.primary.blueHover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colors.primary.blue;
                }}
              >
                {saving ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />}
                <span>Add</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DepartmentManager;
