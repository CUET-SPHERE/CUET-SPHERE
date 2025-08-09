import React, { useState } from 'react';
import { Mail, Plus, Edit, Trash2, X, Save } from 'lucide-react';

const INITIAL_CR_EMAILS = [
  'jane.doe.1901001@student.cuet.ac.bd',
  'john.smith.1902025@student.cuet.ac.bd',
  'alex.ray.1904050@student.cuet.ac.bd',
];

const CRManager = () => {
  const [crEmails, setCrEmails] = useState(INITIAL_CR_EMAILS);
  const [newEmail, setNewEmail] = useState('');
  const [editing, setEditing] = useState(null); // { index, email }
  const [error, setError] = useState('');

  const isValidEmail = (email) => {
    // Simple regex for email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAdd = () => {
    setError('');
    if (!isValidEmail(newEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (newEmail && !crEmails.includes(newEmail)) {
      setCrEmails([...crEmails, newEmail]);
      setNewEmail('');
    } else if (crEmails.includes(newEmail)) {
      setError('This email already exists in the list.');
    }
  };

  const handleDelete = (index) => {
    setCrEmails(crEmails.filter((_, i) => i !== index));
  };

  const handleEdit = () => {
    setError('');
    if (editing && editing.email) {
      if (!isValidEmail(editing.email)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (crEmails.includes(editing.email) && crEmails.indexOf(editing.email) !== editing.index) {
        setError('This email already exists in the list.');
        return;
      }
      const updatedEmails = [...crEmails];
      updatedEmails[editing.index] = editing.email;
      setCrEmails(updatedEmails);
      setEditing(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 lg:col-span-2">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Mail className="text-pink-500" />
        Manage CR Emails
      </h2>
      
      {/* List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
        {crEmails.map((email, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            {editing?.index === index ? (
              <input
                type="email"
                value={editing.email}
                onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                className="bg-transparent w-full focus:outline-none text-gray-900 dark:text-white"
              />
            ) : (
              <span className="text-gray-800 dark:text-gray-200 truncate">{email}</span>
            )}
            <div className="flex items-center gap-2">
              {editing?.index === index ? (
                <>
                  <button onClick={handleEdit} className="p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full"><Save size={16} /></button>
                  <button onClick={() => { setEditing(null); setError(''); }} className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><X size={16} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing({ index, email })} className="p-1.5 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-full"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(index)} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><Trash2 size={16} /></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Add New CR Email</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="cr.email@student.cuet.ac.bd"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-grow p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-pink-500 focus:border-pink-500"
          />
          <button onClick={handleAdd} className="flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
            <Plus size={18} />
            <span>Add Email</span>
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default CRManager;
