import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Star } from 'lucide-react';

function FolderSidebar() {
  const [folders, setFolders] = useState([
    { name: 'L1-T1', expanded: true, items: [] },
    { name: 'L1-T2', expanded: false, items: [] },
  ]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const toggleFolder = (idx) => {
    setFolders((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, expanded: !f.expanded } : f))
    );
  };

  const addFolder = () => {
    if (!newFolderName.trim()) return;
    setFolders([...folders, { name: newFolderName.trim(), expanded: true, items: [] }]);
    setNewFolderName('');
    setShowInput(false);
  };

  return (
    <aside className="bg-indigo-50 rounded-2xl p-4 space-y-4 h-full">
      <h3 className="text-lg font-semibold">Folders & Favourites</h3>

      <button
        onClick={() => setShowInput(!showInput)}
        className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
      >
        <Plus size={16} /> Add Folder
      </button>

      {showInput && (
        <div className="flex gap-2 mt-2">
          <input
            className="flex-1 border rounded px-2 py-1 text-sm"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <button
            onClick={addFolder}
            className="text-sm px-2 py-1 bg-indigo-600 text-white rounded"
          >
            Save
          </button>
        </div>
      )}

      <ul className="space-y-2 text-sm">
        {folders.map((folder, idx) => (
          <li key={idx}>
            <button
              onClick={() => toggleFolder(idx)}
              className="flex items-center w-full justify-between px-2 py-1 rounded hover:bg-indigo-100"
            >
              <span>{folder.name}</span>
              {folder.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {folder.expanded && folder.items.length === 0 && (
              <p className="text-xs text-gray-500 ml-4">(empty)</p>
            )}
          </li>
        ))}
      </ul>

      <hr className="my-4" />
      <button className="flex items-center gap-1 text-sm text-yellow-600 hover:underline">
        <Star size={14} /> Favourite Resources
      </button>
    </aside>
  );
}

export default FolderSidebar;
