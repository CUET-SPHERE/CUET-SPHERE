import React, { useState } from 'react';
import { DEPARTMENTS } from '../../utils/validation';
import { Building, Plus, Edit, Trash2, X, Save } from 'lucide-react';

const DepartmentManager = () => {
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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Building className="text-blue-500" />
        Manage Departments
      </h2>
      
      {/* List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
        {Object.entries(departments).map(([code, name]) => (
          <div key={code} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            {editing?.code === code ? (
              <input
                type="text"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="bg-transparent w-full focus:outline-none text-gray-900 dark:text-white"
              />
            ) : (
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{code}</span>
                <span className="text-gray-800 dark:text-gray-200">{name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              {editing?.code === code ? (
                <>
                  <button onClick={handleEdit} className="p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full"><Save size={16} /></button>
                  <button onClick={() => setEditing(null)} className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><X size={16} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing({ code, name })} className="p-1.5 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-full"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(code)} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><Trash2 size={16} /></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Add New Department</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Code (e.g., 13)"
            value={newDept.code}
            onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
            className="flex-1 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Department Name"
            value={newDept.name}
            onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
            className="flex-grow p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          />
          <button onClick={handleAdd} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManager;
