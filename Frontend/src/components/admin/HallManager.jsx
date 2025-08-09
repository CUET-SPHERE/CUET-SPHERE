import React, { useState } from 'react';
import { HALLS } from '../../utils/validation';
import { Home, Plus, Edit, Trash2, X, Save } from 'lucide-react';

const HallManager = () => {
  const [halls, setHalls] = useState(HALLS);
  const [newHall, setNewHall] = useState('');
  const [editing, setEditing] = useState(null); // { index, name }

  const handleAdd = () => {
    if (newHall && !halls.includes(newHall)) {
      setHalls([...halls, newHall]);
      setNewHall('');
    }
  };

  const handleDelete = (index) => {
    setHalls(halls.filter((_, i) => i !== index));
  };

  const handleEdit = () => {
    if (editing && editing.name) {
      const updatedHalls = [...halls];
      updatedHalls[editing.index] = editing.name;
      setHalls(updatedHalls);
      setEditing(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Home className="text-green-500" />
        Manage Halls
      </h2>
      
      {/* List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
        {halls.map((name, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            {editing?.index === index ? (
              <input
                type="text"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="bg-transparent w-full focus:outline-none text-gray-900 dark:text-white"
              />
            ) : (
              <span className="text-gray-800 dark:text-gray-200">{name}</span>
            )}
            <div className="flex items-center gap-2">
              {editing?.index === index ? (
                <>
                  <button onClick={handleEdit} className="p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full"><Save size={16} /></button>
                  <button onClick={() => setEditing(null)} className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><X size={16} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing({ index, name })} className="p-1.5 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-full"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(index)} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><Trash2 size={16} /></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Add New Hall</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Hall Name"
            value={newHall}
            onChange={(e) => setNewHall(e.target.value)}
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

export default HallManager;
