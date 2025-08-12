import React, { useState } from 'react';
import { useResources } from '../contexts/ResourcesContext';
import { Plus, ChevronDown, Folder, Star, MoreHorizontal, Edit, Trash2, FolderPlus, X } from 'lucide-react';
import FileIcon from './FileIcon';

const FolderItem = ({ folder, level = 0 }) => {
  const { resources, findFolder, addFolder, updateFolderName, deleteFolder, moveResourceToFolder, removeResourceFromFolder } = useResources();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const resourceId = e.dataTransfer.getData('resourceId');
    if (resourceId) {
      moveResourceToFolder(resourceId, folder.id);
    }
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleNameUpdate = () => {
    if (newName.trim()) {
      updateFolderName(folder.id, newName.trim());
    }
    setIsEditing(false);
  };

  const resourcesInFolder = folder.resourceIds.map(id => resources.find(r => r.id === id)).filter(Boolean);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`pl-${level * 2} rounded-lg transition-colors ${isDragOver ? 'bg-primary/20' : ''}`}
    >
      <div className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700/50">
        <div className="flex items-center gap-2 flex-grow min-w-0">
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 flex-shrink-0">
            <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
          </button>
          <div className="flex-shrink-0">
            {folder.isProtected ? <Star size={16} className="text-yellow-500" /> : <Folder size={16} className="text-primary" />}
          </div>
          {isEditing ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleNameUpdate}
              onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
              className="bg-white dark:bg-neutral-800 border-b border-primary outline-none text-sm font-medium w-full text-gray-900 dark:text-text-primary"
              autoFocus
            />
          ) : (
            <span className="text-sm font-medium text-gray-800 dark:text-text-primary truncate">{folder.name}</span>
          )}
        </div>
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-1">
            <MoreHorizontal size={16} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-6 w-40 bg-surface border border-border-color rounded-lg shadow-xl z-10 p-1">
              <button onClick={() => { addFolder(folder.id); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-neutral-700">
                <FolderPlus size={14} /> Add Sub-folder
              </button>
              {!folder.isProtected && (
                <>
                  <button onClick={() => { setIsEditing(true); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-neutral-700">
                    <Edit size={14} /> Rename
                  </button>
                  <button onClick={() => { deleteFolder(folder.id); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-neutral-700 text-error">
                    <Trash2 size={14} /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="pl-6 border-l-2 border-gray-200 dark:border-neutral-700 ml-3">
          {resourcesInFolder.map(res => (
            <div key={res.id} className="group flex items-center justify-between gap-2 text-xs rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700/50">
              <a href={res.file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 w-full min-w-0">
                <FileIcon fileType={res.file.type} className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{res.title}</span>
              </a>
              <button onClick={() => removeResourceFromFolder(res.id, folder.id)} className="p-1 mr-1 text-gray-400 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <X size={12} />
              </button>
            </div>
          ))}
          {folder.children.map(child => (
            <FolderItem key={child.id} folder={child} level={level + 1} />
          ))}
          {resourcesInFolder.length === 0 && folder.children.length === 0 && (
            <p className="text-xs text-text-secondary p-2">(empty)</p>
          )}
        </div>
      )}
    </div>
  );
};

function FolderSidebar() {
  const { folders, addFolder } = useResources();

  return (
    <aside className="bg-white dark:bg-surface rounded-2xl shadow-2xl p-4 space-y-4 h-full border border-gray-200 dark:border-border-color flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-lg font-bold text-gray-800 dark:text-text-primary">Folders</h3>
        <button
          onClick={() => addFolder('root')}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-all text-sm font-semibold"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Folder</span>
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-text-secondary px-1 shrink-0">Keep your study materials structured and accessible.</p>
      <div className="space-y-1 mt-2 overflow-y-auto flex-grow pr-1">
        {folders.children.map(folder => (
          <FolderItem key={folder.id} folder={folder} />
        ))}
      </div>
       <p className="text-xs text-center text-gray-400 dark:text-neutral-600 mt-4 p-2 border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-lg shrink-0">
        Drag & drop files from the resources list into a folder.
      </p>
    </aside>
  );
}

export default FolderSidebar;
