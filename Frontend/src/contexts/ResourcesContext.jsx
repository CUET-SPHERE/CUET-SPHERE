import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import API from '../services/api';

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
  const [resources, setResources] = useState([]);
  const [folders, setFolders] = useState(initialFolders);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch resources from the backend when the component mounts
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const data = await API.getAllResources();

        // Transform API data to match expected format if needed
        const transformedData = Array.isArray(data) ? data.map(resource => {
          // Ensure the resource has all required properties
          return {
            id: resource.resourceId || self.crypto.randomUUID(),
            department: resource.departmentName || user?.department || '',
            batch: resource.batch || user?.batch || '',
            level: parseInt(resource.semesterName?.split('-')[0]) || 1,
            term: parseInt(resource.semesterName?.split('-')[1]) || 1,
            courseCode: resource.courseCode || '',
            courseName: resource.courseName || '',
            title: resource.title || 'Untitled',
            file: {
              name: resource.filePath?.split('/').pop() || 'file.pdf',
              url: resource.filePath || '#',
              type: determineFileType(resource.filePath)
            },
            uploader: resource.uploaderName || resource.uploaderEmail || user?.email || 'Unknown',
            description: resource.description || '',
            downloadCount: resource.downloadCount || 0,
            uploadedAt: resource.createdAt || new Date().toISOString(),
          };
        }) : [];

        setResources(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Helper function to determine file type from URL or file path
    const determineFileType = (filePath) => {
      if (!filePath) return 'application/pdf';

      const extension = filePath.split('.').pop().toLowerCase();
      const mimeTypes = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'txt': 'text/plain',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'zip': 'application/zip',
        'rar': 'application/vnd.rar',
        '7z': 'application/x-7z-compressed'
      };

      return mimeTypes[extension] || 'application/octet-stream';
    };

    if (user) {
      fetchResources();
    }
  }, [user]);

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

  const handleUpload = async (newRes) => {
    try {
      setLoading(true);

      // First upload the file to get a URL
      const fileData = await API.uploadFile(newRes.file, newRes.onProgress);

      if (!fileData || !fileData.fileUrl) {
        throw new Error('File upload failed. No URL was returned from the server.');
      }

      // Extract the semester name based on level and term
      const semesterName = `${newRes.level}-${newRes.term}`;

      const resourceData = {
        title: newRes.title,
        description: newRes.description || '',
        filePath: fileData.fileUrl,
        resourceType: newRes.resourceType || 'LECTURE_NOTE',
        courseCode: newRes.courseCode,
        semesterName: semesterName
      };

      // Then create the resource with the file URL
      const uploadedResource = await API.uploadResource(resourceData);

      // Transform the uploaded resource to match our format
      const formattedResource = {
        id: uploadedResource.resourceId,
        department: uploadedResource.departmentName || user?.department,
        batch: uploadedResource.batch || user?.batch,
        level: parseInt(semesterName.split('-')[0]),
        term: parseInt(semesterName.split('-')[1]),
        courseCode: uploadedResource.courseCode,
        courseName: uploadedResource.courseName,
        title: uploadedResource.title,
        file: {
          name: fileData.fileUrl.split('/').pop(),
          url: fileData.fileUrl,
          type: newRes.file.type
        },
        uploader: uploadedResource.uploaderName || user?.email,
        description: uploadedResource.description,
        downloadCount: 0,
        uploadedAt: uploadedResource.createdAt || new Date().toISOString(),
      };

      // Update the local state with the new resource
      setResources(prev => [formattedResource, ...prev]);
      return formattedResource;
    } catch (err) {
      console.error('Error uploading resource:', err);
      setError('Failed to upload resource. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    resources,
    folders,
    loading,
    error,
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
