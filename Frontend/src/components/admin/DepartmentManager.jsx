import React, { useState } from 'react';
import { DEPARTMENTS } from '../../utils/validation';
import { Building, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const DepartmentManager = () => {
  const { isDark, colors } = useTheme();
  const [departments, setDepartments] = useState(DEPARTMENTS);
  const [newDept, setNewDept] = useState({ code: '', name: '' });
  const [editing, setEditing] = useState(null); // { code, name }

  const handleAdd = () => {
    if (newDept.code && newDept.name && !departments[newDept.code]) {
      setDepartments({ ...departments, [newDept.code]: newDept.name });
      setNewDept({ code: '', name: '' });
    }
  };

  const handleDelete = (code) => {
    const updatedDepts = { ...departments };
    delete updatedDepts[code];
    setDepartments(updatedDepts);
  };

  const handleEdit = () => {
    if (editing && editing.code && editing.name) {
      setDepartments({ ...departments, [editing.code]: editing.name });
      setEditing(null);
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow-md border ${colors.background.surface} border-gray-200 dark:border-gray-700`}>
      <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${colors.text.primary}`}>
        <Building className="text-blue-600" />
        Manage Departments
      </h2>

      {/* List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
        {Object.entries(departments).map(([code, name]) => (
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
                    className="p-1.5 rounded-full transition-colors"
                    style={{
                      color: isDark ? colors.status.success.darkText : colors.status.success.lightText,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = isDark ? colors.status.success.dark : colors.status.success.light;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="p-1.5 rounded-full transition-colors"
                    style={{
                      color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = isDark ? colors.interactive.hoverDark : colors.interactive.hover;
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
                    onClick={() => setEditing({ code, name })}
                    className="p-1.5 rounded-full transition-colors"
                    style={{
                      color: colors.primary.blue,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = colors.primary.blueLight;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(code)}
                    className="p-1.5 rounded-full transition-colors"
                    style={{
                      color: isDark ? colors.status.error.darkText : colors.status.error.lightText,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = isDark ? colors.status.error.dark : colors.status.error.light;
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
        ))}
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
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:outline-none"
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
            className="flex-grow p-2 border rounded-lg focus:ring-2 focus:outline-none"
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
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: colors.primary.blue,
              color: colors.text.primaryDark
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.primary.blueHover;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.primary.blue;
            }}
          >
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManager;
