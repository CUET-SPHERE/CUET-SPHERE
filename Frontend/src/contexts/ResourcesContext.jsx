import React, { createContext, useContext, useState } from 'react';
import { mockResources as initialMockResources } from '../mock/mockResources';
import { useUser } from './UserContext';

const ResourcesContext = createContext();

export const useResources = () => {
  const context = useContext(ResourcesContext);
  if (!context) {
    throw new Error('useResources must be used within a ResourcesProvider');
  }
  return context;
};

const initialFolders = {
  id: 'root',
  children: [
    {
      id: 'favourites',
      name: 'Favourites',
      children: [],
      resourceIds: [],
      isProtected: true,
    },
    {
      id: 'l1t1',
      name: 'L1-T1 Notes',
      children: [],
      resourceIds: ['res1', 'res3'], // Pre-populate with some resources
    },
  ],
};

export const ResourcesProvider = ({ children }) => {
  const { user } = useUser();
  const [resources, setResources] = useState(initialMockResources);
  const [folders, setFolders] = useState(initialFolders);

  const findFolder = (folderId, folderTree = folders) => {
    if (folderTree.id === folderId) return folderTree;
    for (const child of folderTree.children) {
      const found = findFolder(folderId, child);
      if (found) return found;
    }
    return null;
  };

  const addFolder = (parentId) => {
    const newFolder = {
      id: self.crypto.randomUUID(),
      name: 'New Folder',
      children: [],
      resourceIds: [],
    };
    const updateTree = (node) => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newFolder] };
      }
      return { ...node, children: node.children.map(child => updateTree(child)) };
    };
    setFolders(updateTree(folders));
  };

  const updateFolderName = (folderId, newName) => {
    const updateTree = (node) => {
      if (node.id === folderId) {
        return { ...node, name: newName };
      }
      return { ...node, children: node.children.map(child => updateTree(child)) };
    };
    setFolders(updateTree(folders));
  };

  const deleteFolder = (folderId) => {
    const updateTree = (node) => {
      const newChildren = node.children.filter(child => child.id !== folderId);
      return { ...node, children: newChildren.map(child => updateTree(child)) };
    };
    setFolders(updateTree(folders));
  };

  const removeResourceFromFolder = (resourceId, folderId) => {
    const updateTree = (node) => {
      let targetNode = node;
      if (node.id === folderId) {
        const newResourceIds = node.resourceIds.filter(id => id !== resourceId);
        targetNode = { ...node, resourceIds: newResourceIds };
      }
      return { ...targetNode, children: targetNode.children.map(child => updateTree(child)) };
    };
    setFolders(updateTree(folders));
  };

  const moveResourceToFolder = (resourceId, targetFolderId) => {
    // First, remove the resource from any folder it might be in
    const removeFromAllFolders = (node) => {
      const newResourceIds = node.resourceIds.filter(id => id !== resourceId);
      const newChildren = node.children.map(child => removeFromAllFolders(child));
      return { ...node, resourceIds: newResourceIds, children: newChildren };
    };

    // Then, add it to the target folder
    const addToTargetFolder = (node) => {
      if (node.id === targetFolderId) {
        if (!node.resourceIds.includes(resourceId)) {
          return { ...node, resourceIds: [...node.resourceIds, resourceId] };
        }
        return node;
      }
      return { ...node, children: node.children.map(child => addToTargetFolder(child)) };
    };

    const foldersWithResourceRemoved = removeFromAllFolders(folders);
    const newFoldersState = addToTargetFolder(foldersWithResourceRemoved);
    setFolders(newFoldersState);
  };

  const toggleFavourite = (resourceId) => {
    const favFolder = findFolder('favourites');
    if (!favFolder) return;
    const isFavourite = favFolder.resourceIds.includes(resourceId);
    const updateTree = (node) => {
      if (node.id === 'favourites') {
        const newResourceIds = isFavourite
          ? node.resourceIds.filter(id => id !== resourceId)
          : [...node.resourceIds, resourceId];
        return { ...node, resourceIds: newResourceIds };
      }
      return { ...node, children: node.children.map(child => updateTree(child)) };
    };
    setFolders(updateTree(folders));
  };

  const handleUpload = (newRes) => {
    const newResource = {
      id: self.crypto.randomUUID(),
      department: user.department,
      batch: user.batch,
      level: newRes.level,
      term: newRes.term,
      courseCode: newRes.courseCode,
      title: newRes.title,
      file: { name: newRes.file.name, url: URL.createObjectURL(newRes.file), type: newRes.file.type },
      uploader: user.email,
      downloadCount: 0,
      uploadedAt: new Date(),
    };
    setResources(prev => [newResource, ...prev]);
  };

  const value = {
    resources,
    folders,
    addFolder,
    updateFolderName,
    deleteFolder,
    moveResourceToFolder,
    removeResourceFromFolder,
    toggleFavourite,
    findFolder,
    handleUpload,
  };

  return (
    <ResourcesContext.Provider value={value}>
      {children}
    </ResourcesContext.Provider>
  );
};
