import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { useResources } from '../contexts/ResourcesContext';
import { useResourceNavigation } from '../contexts/ResourceNavigationContext';
import { useTheme } from '../contexts/ThemeContext';
import API from '../services/api';
import ResourceUploadModal from './ResourceUploadModal';
import CourseBatchModal from './CourseBatchModal';
import ConfirmationModal from './ConfirmationModal';
import FileIcon from './FileIcon';
import FileTypeIcon, { FileTypeIconWithName } from './FileTypeIcon';
import FileViewer from './FileViewer';
import { getInitials, getAvatarColor } from '../utils/formatters';
import { PlusCircle, Edit, Trash2, Download, ArrowLeft, Eye, ChevronDown, Plus, ChevronRight, MoreHorizontal, X, CalendarClock, Calendar, AlertCircle, User, Folder, FolderOpen, File } from 'lucide-react';

const departmentMap = {
  '04': 'CSE',
  '01': 'CE',
  '02': 'EEE',
  '03': 'ME',
  '05': 'ETE',
};

// Avatar component (same as PostCard)
const Avatar = React.memo(({ src, name, size = 'sm' }) => {
  const sizeClasses = {
    xs: 'w-5 h-5 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 dark:border-gray-600`}
      />
    );
  }

  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  return (
    <div className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-medium`}>
      {initials}
    </div>
  );
});

// Function to format student ID as batch+dept+id (e.g., 2204094)
const formatStudentId = (studentId) => {
  if (!studentId || typeof studentId !== 'string' || studentId.length < 4) return null;

  // Return the original student ID format (e.g., 2204094)
  // No conversion to department abbreviations, just use the department code
  return studentId;
};// Levels and terms constants
const levels = [1, 2, 3, 4];
const terms = [1, 2];

// Initial empty state for courses by level and term
const initialCoursesByLevelTerm = {
  1: { 1: [], 2: [] },
  2: { 1: [], 2: [] },
  3: { 1: [], 2: [] },
  4: { 1: [], 2: [] },
};

function AcademicResources() {
  const { user } = useUser();
  const { colors, buttonClasses, isDark } = useTheme();
  const { resources, toggleFavourite, findFolder, handleUpload: handleResourceUpload, refreshResources, removeResource, loading: resourcesLoading } = useResources();
  const { navigationTarget, clearNavigationTarget, isResourceHighlighted } = useResourceNavigation();

  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedTerm, setSelectedTerm] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null); // Stores the current semester for the batch
  const [expandedFolders, setExpandedFolders] = useState(new Set()); // Track which folders are expanded
  const [pendingNavigation, setPendingNavigation] = useState(null); // Store pending navigation data

  const [courses, setCourses] = useState(initialCoursesByLevelTerm);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseError, setCourseError] = useState(null);

  // Check for current semester when component mounts
  useEffect(() => {
    const fetchCurrentSemester = async () => {
      try {
        const semesterData = await API.getCurrentSemester(user.department, user.batch);
        if (semesterData && semesterData.level && semesterData.term) {
          setCurrentSemester({ level: semesterData.level, term: semesterData.term });
          // If we have a current semester, set it as the selected one
          setSelectedLevel(semesterData.level);
          setSelectedTerm(semesterData.term);
        }
      } catch (err) {
        console.error('Error loading current semester:', err);
      }
    };

    if (user && user.department && user.batch) {
      fetchCurrentSemester();
    }
  }, [user.department, user.batch]);

  // Fetch courses for the selected level and term
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        setCourseError(null);

        const coursesData = await API.getCoursesByLevelAndTerm(
          user.department,
          selectedLevel,
          selectedTerm
        );

        // Process the data
        const formattedCourses = Array.isArray(coursesData) ? coursesData.map(course => ({
          code: course.courseCode || course.code,
          name: course.courseName || course.name
        })) : [];

        setCourses(prev => {
          const newCourses = { ...prev };
          newCourses[selectedLevel] = {
            ...newCourses[selectedLevel],
            [selectedTerm]: formattedCourses
          };
          return newCourses;
        });

      } catch (err) {
        console.error('Error fetching courses:', err);
        setCourseError('Failed to load courses. Please try again later.');
      } finally {
        setLoadingCourses(false);
      }
    };

    if (user && user.department) {
      fetchCourses();
    }
  }, [selectedLevel, selectedTerm, user.department]);

  // Auto-expand all folder resources when resources change or course is selected
  useEffect(() => {
    if (selectedCourse && resources.length > 0) {
      const courseResources = resources.filter(r => r.courseCode === selectedCourse.code);
      const folderIds = courseResources
        .filter(resource => resource.isFolder && resource.files && resource.files.length > 0)
        .map(resource => resource.id || resource.resourceId);

      if (folderIds.length > 0) {
        setExpandedFolders(new Set(folderIds));
      }
    }
  }, [resources, selectedCourse]);

  // Handle navigation from Recent Uploads
  useEffect(() => {
    if (navigationTarget) {
      console.log('Navigation target received:', navigationTarget);

      const { level, term, courseCode, resourceId } = navigationTarget;

      // Store the navigation data for later use
      setPendingNavigation({ courseCode, resourceId });

      // Update level and term if different
      if (level && level !== selectedLevel) {
        console.log('Updating level from', selectedLevel, 'to', level);
        setSelectedLevel(level);
      }
      if (term && term !== selectedTerm) {
        console.log('Updating term from', selectedTerm, 'to', term);
        setSelectedTerm(term);
      }

      // Clear the navigation target after handling it
      clearNavigationTarget();
    }
  }, [navigationTarget, selectedLevel, selectedTerm, clearNavigationTarget]);

  // Handle course selection after level/term change and courses are loaded
  useEffect(() => {
    const currentCourses = courses[selectedLevel]?.[selectedTerm] || [];

    if (pendingNavigation && currentCourses.length > 0) {
      const { courseCode, resourceId } = pendingNavigation;

      console.log('Looking for course:', courseCode, 'in available courses:', currentCourses.map(c => c.code));

      // Find and select the target course
      const targetCourse = currentCourses.find(course => course.code === courseCode);
      if (targetCourse) {
        console.log('Found target course:', targetCourse);
        setSelectedCourse(targetCourse);

        // Clear pending navigation
        setPendingNavigation(null);

        // Scroll to the resource after a delay
        setTimeout(() => {
          const resourceElement = document.querySelector(`[data-resource-id="${resourceId}"]`);
          if (resourceElement) {
            console.log('Scrolling to resource element');
            resourceElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          } else {
            console.log('Resource element not found with id:', resourceId);
          }
        }, 1000);
      } else {
        console.log('Target course not found:', courseCode);
      }
    }
  }, [courses, selectedLevel, selectedTerm, pendingNavigation]);

  // Function to refresh courses when data is out of sync
  const refreshCourses = useCallback(async () => {
    if (user && user.department) {
      try {
        setLoadingCourses(true);
        setCourseError('');

        const response = await API.getCoursesByDepartmentAndSemester(
          user.department,
          `${selectedLevel}-${selectedTerm}`
        );

        setCourses(prev => {
          const newCourses = { ...prev };
          if (!newCourses[selectedLevel]) {
            newCourses[selectedLevel] = {};
          }

          // Update the courses for the current level and term
          newCourses[selectedLevel][selectedTerm] = response.map(course => ({
            code: course.courseCode,
            name: course.courseName,
            id: course.courseId,
            semesterId: course.semesterId
          }));
          return newCourses;
        });

      } catch (err) {
        console.error('Error refreshing courses:', err);
        setCourseError('Failed to refresh courses. Please try again later.');
      } finally {
        setLoadingCourses(false);
      }
    }
  }, [user.department, selectedLevel, selectedTerm]);

  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isCourseBatchModalOpen, setCourseBatchModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isFileViewerOpen, setFileViewerOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Add loading state for delete operations

  const [editingCourse, setEditingCourse] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [isEditResourceModalOpen, setEditResourceModalOpen] = useState(false);
  const [isUpdatingResource, setIsUpdatingResource] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: '', show: boolean }

  // Notification helper functions
  const showSuccessNotification = (message) => {
    setNotification({ type: 'success', message, show: true });
    setTimeout(() => setNotification(null), 4000); // Auto hide after 4 seconds
  };

  const showErrorNotification = (message) => {
    setNotification({ type: 'error', message, show: true });
    setTimeout(() => setNotification(null), 6000); // Keep error messages longer
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // File viewer functions
  const handleViewFile = (resource, file = null) => {
    let fileUrl, fileName;

    if (file) {
      // Viewing a specific file in a folder
      fileUrl = file.filePath;
      fileName = file.fileName;
    } else {
      // Viewing a single file resource or the main file
      fileUrl = resource.fileUrl || resource.file?.url || resource.filePath;
      fileName = resource.file?.name || resource.fileName || resource.title;
    }

    if (!fileUrl) {
      console.error('No file URL found for resource:', resource, 'file:', file);
      return;
    }

    // Open all files in the FileViewer modal - it will handle different types appropriately
    setViewingFile({
      url: fileUrl,
      name: fileName,
      type: resource.resourceType
    });
    setFileViewerOpen(true);
  };

  // Folder management functions
  const toggleFolder = (resourceId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Remove file from folder resource
  const handleRemoveFileFromResource = async (resourceId, fileId) => {
    try {
      const updatedResource = await API.removeFileFromResource(resourceId, fileId);
      // Update the resources context or trigger a refresh
      handleResourceUpload(updatedResource);
      showSuccessNotification('File removed successfully!');
    } catch (error) {
      console.error('Error removing file:', error);
      showErrorNotification(error.message || 'Failed to remove file');
    }
  };

  // Add more files to existing folder resource
  const handleAddMoreFiles = async (resourceId, files) => {
    try {
      showSuccessNotification('Uploading additional files...');

      const updatedResource = await API.addFilesToResource(resourceId, files, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });

      // Refresh resources to get the updated data
      await refreshResources();
      showSuccessNotification(`Successfully added ${files.length} file(s) to the folder!`);
    } catch (error) {
      console.error('Error adding files to resource:', error);
      showErrorNotification(error.message || 'Failed to add files to folder');
    }
  };

  // Edit resource functions
  const handleEditResource = (resource) => {
    console.log('Edit resource clicked:', resource);
    console.log('Resource type from resource:', resource.resourceType);
    setEditingResource({
      id: resource.id || resource.resourceId,
      title: resource.title,
      description: resource.description || '',
      resourceType: resource.resourceType || 'LECTURE_NOTE' // Ensure we have a valid resource type
    });
    setEditResourceModalOpen(true);
    console.log('Edit modal should be open now');
  };

  const handleSaveResource = async (resourceData) => {
    try {
      setIsUpdatingResource(true);
      const resourceId = editingResource.id;
      console.log('Saving resource:', resourceId, resourceData);

      // Get the original resource to extract required fields
      const originalResource = resources.find(r => (r.id || r.resourceId) === resourceId);
      if (!originalResource) {
        throw new Error('Original resource not found');
      }

      console.log('Original resource:', originalResource);

      // Prepare the update data (include all required fields from ResourceRequest)
      const updateData = {
        title: resourceData.title,
        description: resourceData.description || '',
        resourceType: originalResource.resourceType || 'LECTURE_NOTE', // Use original or default
        filePath: originalResource.filePath || originalResource.fileUrl || originalResource.file?.url || '', // Keep original file path
        courseCode: originalResource.courseCode || selectedCourse?.code || '', // Keep original course code
        semesterName: originalResource.semesterName || `${selectedLevel}-${selectedTerm}` // Keep original semester
      };

      console.log('Update data:', updateData);
      const result = await API.updateResource(resourceId, updateData);
      console.log('Update result:', result);

      // Refresh resources to get the updated data
      await refreshResources();

      // Close the modal and reset state
      setEditResourceModalOpen(false);
      setEditingResource(null);

      showSuccessNotification('Resource updated successfully!');
    } catch (error) {
      console.error('Error updating resource:', error);
      showErrorNotification(error.message || 'Failed to update resource');
    } finally {
      setIsUpdatingResource(false);
    }
  };

  const handleCloseFileViewer = () => {
    setFileViewerOpen(false);
    setViewingFile(null);
  };

  const [deletingItem, setDeletingItem] = useState(null);

  const favouritesFolder = findFolder('favourites');
  const favouriteResourceIds = favouritesFolder ? favouritesFolder.resourceIds : [];

  // Filter resources by course code and apply other filters as needed
  const getResourcesForCourse = (courseCode) =>
    resources.filter(
      (r) => r.courseCode === courseCode
      // Additional filters can be added here if needed
      // && r.level === selectedLevel
      // && r.term === selectedTerm
    );

  const handleSaveCourse = async (courseData) => {
    try {
      if (editingCourse) {
        // Editing existing course - call update API
        console.log('Updating existing course:', editingCourse.code, 'with data:', courseData);
        console.log('API payload will be:', {
          courseCode: courseData.code,
          courseName: courseData.name,
          department: user.department,
          semesterName: `${selectedLevel}-${selectedTerm}`
        });

        await API.updateCourseByCode(editingCourse.code, {
          courseCode: courseData.code,
          courseName: courseData.name,
          department: user.department,
          semesterName: `${selectedLevel}-${selectedTerm}`
        });

        // Update local state only after successful API call
        setCourses(prev => {
          const newCourses = { ...prev };
          const termCourses = [...newCourses[selectedLevel][selectedTerm]];
          const index = termCourses.findIndex(c => c.code === editingCourse.code);
          if (index > -1) {
            termCourses[index] = courseData;
          }
          newCourses[selectedLevel][selectedTerm] = termCourses;
          return newCourses;
        });

        showSuccessNotification('Course updated successfully!');
      } else {
        // Creating new course - call create API
        console.log('Creating new course:', courseData);
        await API.saveCourse({
          courseCode: courseData.code,
          courseName: courseData.name,
          department: user.department,
          semesterName: `${selectedLevel}-${selectedTerm}`
        });

        // Update local state only after successful API call
        setCourses(prev => {
          const newCourses = { ...prev };
          const termCourses = [...newCourses[selectedLevel][selectedTerm]];
          termCourses.push(courseData);
          newCourses[selectedLevel][selectedTerm] = termCourses;
          return newCourses;
        });

        showSuccessNotification('Course created successfully!');
      }

      setEditingCourse(null);
    } catch (error) {
      console.error('Error saving course:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        editingCourse: editingCourse,
        courseData: courseData
      });

      // Provide more specific error messages
      let errorMessage = error.message;
      if (errorMessage.includes('already exists')) {
        errorMessage = `Course code "${courseData.code}" already exists in your department. Please choose a different course code.`;
      } else if (errorMessage.includes('not found')) {
        // Handle the case where the course to be updated no longer exists
        errorMessage = `Course "${editingCourse.code}" was not found in the database. It may have been deleted by another user. Refreshing course list...`;

        // Close the editing modal since the course doesn't exist
        setEditingCourse(null);

        // Refresh the course list to sync with backend
        setTimeout(() => {
          refreshCourses();
        }, 2000);

      } else if (errorMessage.includes('403') || errorMessage.includes('Only CR users')) {
        errorMessage = `You don't have permission to ${editingCourse ? 'update' : 'create'} courses. Only CR users can perform this action.`;
      } else if (errorMessage.includes('Department code is required')) {
        errorMessage = `Department information is missing. Please refresh the page and try again.`;
      }

      showErrorNotification(`Failed to ${editingCourse ? 'update' : 'create'} course: ${errorMessage}`);
    }
  };

  const handleSaveMultipleCourses = (coursesDataArray) => {
    setCourses(prev => {
      const newCourses = { ...prev };
      const termCourses = [...newCourses[selectedLevel][selectedTerm]];

      // Add all new courses
      coursesDataArray.forEach(courseData => {
        // Check if course with this code already exists
        const existingIndex = termCourses.findIndex(c => c.code === courseData.code);
        if (existingIndex === -1) {
          termCourses.push(courseData);
        }
      });

      newCourses[selectedLevel][selectedTerm] = termCourses;
      return newCourses;
    });
  };

  const openDeleteModal = (type, data) => {
    setDeletingItem({ type, data });
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    const { type, data } = deletingItem;

    if (type === 'course') {
      try {
        // Debug: Log the course object to see its structure
        console.log('Course object being deleted:', data);
        console.log('Available keys:', Object.keys(data));

        // Delete by course code (the only supported method now)
        if (data.code) {
          console.log('Deleting course by code:', data.code);
          await API.deleteCourseByCode(data.code);
        } else {
          console.error('No course code found. Available properties:', Object.keys(data));
          showErrorNotification('Cannot delete course: No course code found.');
          setConfirmModalOpen(false);
          setDeletingItem(null);
          return;
        }

        // Only update local state after successful API call
        setCourses(prev => {
          const newCourses = { ...prev };
          newCourses[selectedLevel][selectedTerm] = newCourses[selectedLevel][selectedTerm].filter(c => c.code !== data.code);
          return newCourses;
        });

        // Show success feedback
        console.log('Course deleted successfully from database');
        showSuccessNotification('Course deleted successfully!');
      } catch (error) {
        console.error('Error deleting course:', error);

        // Provide more specific error messages
        let errorMessage = error.message;
        if (errorMessage.includes('not found')) {
          errorMessage = `Course "${data.code}" not found. It may have already been deleted by another user.`;
        } else if (errorMessage.includes('403') || errorMessage.includes('Only CR users')) {
          errorMessage = `You don't have permission to delete courses. Only CR users can perform this action.`;
        } else if (errorMessage.includes('has resources')) {
          errorMessage = `Cannot delete course "${data.code}" because it has associated resources. Please remove all resources first.`;
        }

        showErrorNotification(`Failed to delete course: ${errorMessage}`);
        setConfirmModalOpen(false);
        setDeletingItem(null);
        return; // Don't continue if API call failed
      }
    } else if (type === 'resource') {
      try {
        setIsDeleting(true); // Start loading
        console.log('Resource object being deleted:', data);
        const resourceId = data.id || data.resourceId;

        if (!resourceId) {
          console.error('No resource ID found. Available properties:', Object.keys(data));
          showErrorNotification('Cannot delete resource: No resource ID found.');
          setConfirmModalOpen(false);
          setDeletingItem(null);
          setIsDeleting(false);
          return;
        }

        console.log('Deleting resource by ID:', resourceId);
        await API.deleteResource(resourceId);

        // Immediately remove the resource from UI for instant feedback
        removeResource(resourceId);

        // Note: We could still call refreshResources() for data consistency if needed,
        // but immediate removal should be sufficient for better UX

        showSuccessNotification('Resource deleted successfully!');
      } catch (error) {
        console.error('Error deleting resource:', error);

        let errorMessage = error.message;
        if (errorMessage.includes('not found')) {
          errorMessage = `Resource not found. It may have already been deleted.`;
        } else if (errorMessage.includes('403') || errorMessage.includes('permission')) {
          errorMessage = `You don't have permission to delete this resource.`;
        }

        showErrorNotification(`Failed to delete resource: ${errorMessage}`);
      } finally {
        setIsDeleting(false); // Stop loading
        setConfirmModalOpen(false);
        setDeletingItem(null);
      }
    }

    // For non-resource deletions, still clean up the modal state
    if (type !== 'resource') {
      setConfirmModalOpen(false);
      setDeletingItem(null);
    }
  };

  const handleUpload = (newRes) => {
    if (!selectedCourse || !selectedCourse.code) {
      console.error('Selected course is missing or invalid:', selectedCourse);
      return;
    }
    handleResourceUpload({ ...newRes, courseCode: selectedCourse.code });
  };

  const handleDragStart = (e, resourceId) => {
    e.dataTransfer.setData('resourceId', resourceId);
  };

  const setAsCurrentSemester = async () => {
    // Create the current semester object
    const semesterData = { level: selectedLevel, term: selectedTerm };

    try {
      // Save the current semester using the API
      await API.setCurrentSemester(user.department, user.batch, semesterData);

      setCurrentSemester(semesterData);

      // Provide visual feedback - this would be better with a toast notification
      // For now using a simple timeout to show feedback
      const feedbackElement = document.createElement('div');
      feedbackElement.textContent = 'Ongoing semester updated successfully!';
      feedbackElement.style.cssText = 'position:fixed; bottom:20px; right:20px; background-color:#10b981; color:white; padding:12px 20px; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1); z-index:1000; transition:opacity 0.3s ease;';
      document.body.appendChild(feedbackElement);

      setTimeout(() => {
        feedbackElement.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(feedbackElement);
        }, 300);
      }, 3000);

    } catch (err) {
      console.error('Error saving ongoing semester:', err);

      // Error feedback
      const errorElement = document.createElement('div');
      errorElement.textContent = 'Failed to set ongoing semester. Please try again.';
      errorElement.style.cssText = 'position:fixed; bottom:20px; right:20px; background-color:#ef4444; color:white; padding:12px 20px; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1); z-index:1000; transition:opacity 0.3s ease;';
      document.body.appendChild(errorElement);

      setTimeout(() => {
        errorElement.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(errorElement);
        }, 300);
      }, 3000);
    }
  };

  const currentCourses = courses[selectedLevel]?.[selectedTerm] || [];
  const midPoint = Math.ceil(currentCourses.length / 2);
  const courseCol1 = currentCourses.slice(0, midPoint);
  const courseCol2 = currentCourses.slice(midPoint);

  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);

  return (
    <div className={`${colors?.glass || (isDark ? 'bg-slate-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm')} rounded-2xl ${colors?.shadow || 'shadow-xl'} ${colors?.shadowHover || 'hover:shadow-2xl'} p-4 sm:p-6 flex flex-col h-full ${colors?.border || 'border-slate-200 dark:border-slate-600'} border transition-all duration-300`}>
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className={`text-xl sm:text-2xl font-bold ${colors?.textPrimary || 'text-gray-800 dark:text-text-primary'}`}>
          Academic Resources
          <span className={`block sm:inline text-base font-normal ${colors?.textSecondary || 'text-gray-500 dark:text-text-secondary'} ml-0 sm:ml-2`}>
            ({departmentMap[user.department]} - Batch '{user.batch}')
          </span>
        </h2>
      </div>

      <div className="flex flex-col gap-6 flex-grow overflow-y-auto scrollbar-hide pr-2 min-h-0">
        {/* Navigation Bar */}
        <div className={`flex justify-between items-center ${colors?.border || 'border-gray-200 dark:border-border-color'} border-b pb-2 shrink-0`}>
          <div className="flex flex-wrap items-center gap-3">
            {/* Level dropdown */}
            <div className="relative">
              <button
                className={`flex items-center gap-2 px-4 py-2.5 ${colors?.gradient || (isDark ? 'bg-gradient-to-r from-slate-700 to-slate-600' : 'bg-gradient-to-r from-white to-slate-50')} rounded-lg ${colors?.border || 'border-slate-200 dark:border-slate-600'} border ${colors?.hover || 'hover:bg-slate-100 dark:hover:bg-slate-700'} ${colors?.shadow || 'shadow-sm'} ${colors?.shadowHover || 'hover:shadow-md'} transition-all duration-200 font-medium`}
                onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
              >
                <span>Level {selectedLevel}</span>
                <ChevronDown size={16} className={`transition-transform ${isLevelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLevelDropdownOpen && (
                <div className={`absolute top-full left-0 mt-2 ${colors?.glass || (isDark ? 'bg-slate-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm')} ${colors?.border || 'border-slate-200 dark:border-slate-600'} border rounded-xl ${colors?.shadow || 'shadow-xl'} z-10 w-40 overflow-hidden`}>
                  {levels.map((level) => (
                    <button
                      key={level}
                      className={`w-full text-left px-4 py-3 ${colors?.hover || 'hover:bg-slate-100 dark:hover:bg-slate-700'} transition-all duration-200 font-medium ${selectedLevel === level ? colors?.primaryBg + ' ' + colors?.primary || 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : colors?.textPrimary || 'text-slate-900 dark:text-slate-50'}`}
                      onClick={() => {
                        setSelectedLevel(level);
                        setSelectedTerm(1);
                        setSelectedCourse(null);
                        setIsLevelDropdownOpen(false);
                      }}
                    >
                      Level {level}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ongoing Semester Button */}
            {currentSemester && (
              <button
                onClick={() => {
                  setSelectedLevel(currentSemester.level);
                  setSelectedTerm(currentSemester.term);
                  setSelectedCourse(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all
                  ${selectedLevel === currentSemester.level && selectedTerm === currentSemester.term
                    ? colors?.primaryBg + ' ' + colors?.primary || 'bg-primary/20 text-primary'
                    : 'bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                  }`}
                title="Go to the ongoing semester"
              >
                <Calendar size={16} className={selectedLevel === currentSemester.level && selectedTerm === currentSemester.term ? colors?.primary || 'text-primary' : 'text-amber-600 dark:text-amber-400'} />
                <span>Ongoing Semester</span>
              </button>
            )}

            {/* Set Current Semester Button (CR only) */}
            {user.role === 'CR' && !currentSemester && (
              <button
                onClick={setAsCurrentSemester}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-lg transition-all"
                title="Set this as the ongoing semester for your batch"
              >
                <CalendarClock size={16} className="text-amber-600 dark:text-amber-400" />
                <span>Set as Ongoing Semester</span>
              </button>
            )}

            {/* Update Current Semester Button (CR only) */}
            {user.role === 'CR' && currentSemester &&
              (selectedLevel !== currentSemester.level || selectedTerm !== currentSemester.term) && (
                <button
                  onClick={setAsCurrentSemester}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-lg transition-all"
                  title="Update the ongoing semester for your batch"
                >
                  <CalendarClock size={16} className="text-amber-600 dark:text-amber-400" />
                  <span>Update Ongoing Semester</span>
                </button>
              )}
          </div>
        </div>

        <div className="w-full flex-grow">
          {!selectedCourse ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 sm:gap-4">
                  {terms.map((term) => (
                    <button
                      key={term}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${selectedTerm === term
                        ? colors?.primaryBg + ' ' + colors?.primary + ' ' + colors?.shadow || 'bg-blue-50 text-blue-600 shadow-md dark:bg-blue-900/30 dark:text-blue-400'
                        : colors?.gradient + ' ' + colors?.textSecondary + ' ' + colors?.hover + ' ' + colors?.shadowHover || 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 hover:from-slate-200 hover:to-slate-100 dark:from-slate-700 dark:to-slate-600 dark:text-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 hover:shadow-md'
                        }`}
                      onClick={() => { setSelectedTerm(term); setSelectedCourse(null); }}
                      disabled={loadingCourses}
                    >
                      Term {term}
                    </button>
                  ))}
                </div>
                {user.role === 'CR' && (
                  <button
                    onClick={() => setCourseBatchModalOpen(true)}
                    className={`flex items-center gap-2 ${buttonClasses?.primary || 'px-4 py-2 bg-primary hover:bg-purple-600 text-white rounded-lg'} transition-all text-sm font-semibold`}
                    disabled={loadingCourses}
                  >
                    <PlusCircle size={18} />
                    <span className="hidden sm:inline">Add Course</span>
                  </button>
                )}
              </div>

              {loadingCourses ? (
                <div className="flex justify-center items-center h-64">
                  <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${colors?.primary || 'border-primary'}`}></div>
                </div>
              ) : courseError ? (
                <div className={`text-center py-10 border-2 border-dashed ${colors?.border || 'border-gray-300 dark:border-border-color'} rounded-lg`}>
                  <AlertCircle className="mx-auto text-error mb-2" size={24} />
                  <p className="text-error">{courseError}</p>
                  <button
                    onClick={() => {
                      setCourseError(null);
                      setSelectedLevel(selectedLevel);
                      setSelectedTerm(selectedTerm);
                    }}
                    className={`mt-4 ${buttonClasses?.primary || 'px-4 py-2 bg-primary text-white rounded-lg hover:bg-purple-600'} transition-colors`}
                  >
                    Retry
                  </button>
                </div>
              ) : currentCourses.length === 0 ? (
                <div className={`text-center py-10 border-2 border-dashed ${colors?.border || 'border-gray-300 dark:border-border-color'} rounded-lg`}>
                  <p className={`${colors?.textSecondary || 'text-gray-500 dark:text-text-secondary'}`}>No courses found for this term.</p>
                  {user.role === 'CR' && (
                    <button
                      onClick={() => setCourseBatchModalOpen(true)}
                      className={`mt-4 flex items-center gap-2 ${buttonClasses?.primary || 'px-4 py-2 bg-primary hover:bg-purple-600 text-white rounded-lg'} transition-all text-sm font-semibold mx-auto`}
                    >
                      <Plus size={18} />
                      <span>Add Course</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[courseCol1, courseCol2].map((col, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-3">
                      {col.map((course) => (
                        <div key={course.code} className="flex flex-col">
                          <div className={`group p-5 ${colors?.gradient || (isDark ? 'bg-gradient-to-br from-slate-700 to-slate-800' : 'bg-gradient-to-br from-white to-slate-50')} rounded-xl ${colors?.border || 'border-slate-200 dark:border-slate-600'} border ${colors?.gradientHover || 'hover:from-slate-600 hover:to-slate-700 dark:hover:from-slate-600 dark:hover:to-slate-700'} ${colors?.shadowHover || 'hover:shadow-lg'} transition-all duration-300 flex justify-between items-center group-hover:scale-[1.02]`}>
                            <button className="text-left w-full" onClick={() => setSelectedCourse(course)}>
                              <p className={`font-bold text-lg ${colors?.textPrimary || 'text-slate-900 dark:text-slate-50'} group-hover:${colors?.primary || 'text-blue-600'} transition-colors duration-200`}>{course.name}</p>
                              <p className={`text-sm font-medium ${colors?.textSecondary || 'text-slate-600 dark:text-slate-300'} mt-1`}>{course.code}</p>
                            </button>
                            {user.role === 'CR' && (
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setEditingCourse(course);
                                    setCourseBatchModalOpen(true);
                                  }}
                                  className={`p-2 ${colors?.textSecondary || 'text-gray-500 dark:text-text-secondary'} hover:text-secondary`}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => openDeleteModal('course', course)}
                                  className={`p-2 ${colors?.textSecondary || 'text-gray-500 dark:text-text-secondary'} hover:text-error`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex-grow">
                  <button className={`flex items-center gap-2 text-sm ${colors?.textSecondary || 'text-gray-500 dark:text-text-secondary'} hover:${colors?.primary || 'text-primary'} mb-2`} onClick={() => setSelectedCourse(null)}>
                    <ArrowLeft size={16} /> Back to Courses
                  </button>
                  <h3 className={`text-xl font-semibold ${colors?.textPrimary || 'text-gray-800 dark:text-text-primary'}`}>{selectedCourse.name}</h3>
                  <p className={`${colors?.textSecondary || 'text-gray-500 dark:text-text-secondary'}`}>{selectedCourse.code}</p>
                </div>
                {user.role === 'CR' && (
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className={`flex items-center gap-2 ${buttonClasses?.success || 'px-3 py-2 bg-success hover:bg-emerald-600 text-white rounded-lg'} transition-all text-sm font-semibold`}
                    disabled={resourcesLoading}
                  >
                    <PlusCircle size={18} />
                    <span className="hidden sm:inline">Upload File</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* Show loading, error or resources */}
                {resourcesLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${colors?.primary || 'border-primary'}`}></div>
                  </div>
                ) : getResourcesForCourse(selectedCourse.code).length > 0 ? (
                  getResourcesForCourse(selectedCourse.code).map((res) => (
                    <ResourceCard
                      key={res.id || res.resourceId}
                      resource={res}
                      user={user}
                      expandedFolders={expandedFolders}
                      onToggleFolder={toggleFolder}
                      onViewFile={handleViewFile}
                      onRemoveFile={handleRemoveFileFromResource}
                      onAddMoreFiles={handleAddMoreFiles}
                      onEditResource={handleEditResource}
                      onDeleteResource={(resource) => openDeleteModal('resource', resource)}
                      onDragStart={handleDragStart}
                      isHighlighted={isResourceHighlighted(res.id || res.resourceId)}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-border-color rounded-lg">
                    <p className="text-gray-500 dark:text-text-secondary">No files uploaded for this course yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <CourseBatchModal
        isOpen={isCourseBatchModalOpen}
        onClose={() => {
          setCourseBatchModalOpen(false);
          setEditingCourse(null);
        }}
        onSave={editingCourse ? handleSaveCourse : handleSaveMultipleCourses}
        level={selectedLevel}
        term={selectedTerm}
        editingCourse={editingCourse}
      />
      <ResourceUploadModal
        open={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUpload}
        course={selectedCourse}
        level={selectedLevel}
        term={selectedTerm}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title={`Delete ${deletingItem?.type}`}
        message={`Are you sure you want to permanently delete this ${deletingItem?.type}? This action cannot be undone.`}
        loading={isDeleting}
      />

      {/* Notification Modal */}
      {notification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={hideNotification}
          ></div>

          {/* Modal */}
          <div className="relative bg-white dark:bg-card-dark rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border border-border-light dark:border-border-dark">
            <div className="flex items-start">
              {/* Icon */}
              <div className={`flex-shrink-0 ${notification.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {notification.type === 'success' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                  {notification.type === 'success' ? 'Success' : 'Error'}
                </h3>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {notification.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={hideNotification}
                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Progress Bar for Auto-hide */}
            <div className={`mt-4 w-full ${colors?.border || 'bg-slate-200 dark:bg-slate-700'} rounded-full h-1`}>
              <div
                className={`h-1 rounded-full ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} transition-all ease-linear`}
                style={{
                  width: '100%',
                  animation: `progress-shrink ${notification.type === 'success' ? '4s' : '6s'} linear`
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {isEditResourceModalOpen && editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => {
              setEditResourceModalOpen(false);
              setEditingResource(null);
            }}
          ></div>

          {/* Modal */}
          <div className="relative bg-white dark:bg-card-dark rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-text-primary">
                Edit Resource
              </h3>
              <button
                onClick={() => {
                  setEditResourceModalOpen(false);
                  setEditingResource(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleSaveResource({
                  title: formData.get('title'),
                  description: formData.get('description')
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingResource.title}
                  required
                  disabled={isUpdatingResource}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                  placeholder="Enter resource title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingResource.description}
                  rows={3}
                  disabled={isUpdatingResource}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                  placeholder="Enter resource description (optional)"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditResourceModalOpen(false);
                    setEditingResource(null);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  disabled={isUpdatingResource}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingResource}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium flex items-center gap-2"
                >
                  {isUpdatingResource && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  )}
                  {isUpdatingResource ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Viewer Modal */}
      <FileViewer
        isOpen={isFileViewerOpen}
        onClose={handleCloseFileViewer}
        fileUrl={viewingFile?.url}
        fileName={viewingFile?.name}
        fileType={viewingFile?.type}
      />
    </div>
  );
}

// ResourceCard component to handle both single files and folders
const ResourceCard = ({
  resource,
  user,
  expandedFolders,
  onToggleFolder,
  onViewFile,
  onRemoveFile,
  onAddMoreFiles,
  onEditResource,
  onDeleteResource,
  onDragStart,
  isHighlighted = false
}) => {
  const { colors, buttonClasses } = useTheme();
  const isFolder = resource.isFolder && resource.files && resource.files.length > 0;
  const isExpanded = expandedFolders.has(resource.id || resource.resourceId);
  const resourceId = resource.id || resource.resourceId;

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      draggable="true"
      onDragStart={(e) => onDragStart(e, resourceId)}
      data-resource-id={resourceId}
      className={`${colors?.gradient || (isDark ? 'bg-gradient-to-br from-slate-700 to-slate-800' : 'bg-gradient-to-br from-white to-slate-50')} rounded-xl ${colors?.border || 'border-slate-200 dark:border-slate-600'} border ${colors?.shadowHover || 'hover:shadow-lg'} transition-all duration-300 hover:scale-[1.01] group ${isHighlighted
        ? `ring-2 ring-blue-500 ring-opacity-60 ${colors?.primaryBg || 'bg-blue-50/50 dark:bg-blue-900/20'} ${colors?.primary || 'border-blue-500'}`
        : ''
        }`}
    >
      {/* Main Resource Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Folder/File Icon with Expand Button */}
          <div className="flex items-center gap-2">
            {isFolder ? (
              <button
                onClick={() => onToggleFolder(resourceId)}
                className={`flex items-center gap-1 ${colors?.hover || 'hover:bg-slate-200 dark:hover:bg-slate-600'} p-2 rounded-lg transition-all duration-200`}
              >
                {isExpanded ? (
                  <FolderOpen size={28} className="text-blue-600 dark:text-blue-400" />
                ) : (
                  <Folder size={28} className="text-blue-600 dark:text-blue-400" />
                )}
                <ChevronRight
                  size={16}
                  className={`${colors?.textSecondary || 'text-gray-500'} transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>
            ) : (
              <FileTypeIcon
                filename={resource.file?.name || resource.fileName || resource.fileUrl?.split('/').pop() || resource.filePath?.split('/').pop() || resource.title}
                size={28}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Resource Title */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => isFolder ? onToggleFolder(resourceId) : onViewFile(resource)}
                className={`resource-title-button font-semibold ${colors?.textPrimary || 'text-gray-800 dark:text-text-primary'} hover:${colors?.primary || 'text-primary'} transition-colors block truncate text-left cursor-pointer`}
              >
                {resource.title}
              </button>
              {isFolder && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                  {resource.fileCount || resource.files?.length || 0} files
                </span>
              )}
            </div>

            {/* Resource Description */}
            {resource.description && (
              <p className={`text-sm ${colors?.textMuted || 'text-gray-600 dark:text-gray-400'} mt-1 truncate`}>
                {resource.description}
              </p>
            )}

            {/* Uploader Information and Upload Date */}
            <div className={`flex items-center gap-3 text-xs ${colors?.textSecondary || 'text-gray-500 dark:text-text-secondary'} mt-2`}>
              <Avatar src={resource.uploaderProfilePicture} name={resource.uploaderName} size="xs" />
              <div className="flex items-center gap-2">
                <span className={`font-medium ${colors?.textPrimary || 'text-gray-700 dark:text-gray-300'}`}>
                  {resource.uploaderName || 'Unknown'}
                </span>
                <span className={`${colors?.textMuted || 'text-gray-300 dark:text-gray-600'}`}>•</span>
                <span>Student ID: {formatStudentId(resource.uploaderStudentId) || 'Unknown'}</span>
                <span className={`${colors?.textMuted || 'text-gray-300 dark:text-gray-600'}`}>•</span>
                <span>
                  {new Date(resource.uploadedAt || resource.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                {resource.resourceType && (
                  <>
                    <span className={`${colors?.textMuted || 'text-gray-300 dark:text-gray-600'}`}>•</span>
                    <span className="capitalize">
                      {resource.resourceType.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-4">
          {/* Debug info for edit button visibility */}
          {console.log('Resource action buttons - User role:', user.role, 'Uploader email:', resource.uploaderEmail, 'User email:', user.email, 'Uploader name:', resource.uploader, 'User full name:', user.fullName)}

          {!isFolder && (
            <>
              <button
                onClick={() => onViewFile(resource)}
                className={`p-2 rounded-md ${colors?.textSecondary || 'text-gray-500 dark:text-text-secondary'} hover:${colors?.primaryBg || 'bg-primary/20'} hover:${colors?.primary || 'text-primary'} transition-colors`}
                title={`View ${resource.title}`}
              >
                <Eye size={16} />
              </button>
              <a
                href={resource.fileUrl || resource.file?.url || resource.filePath}
                download={resource.file?.name || resource.fileName || resource.title}
                className={`p-2 rounded-md ${colors?.textSecondary || 'text-gray-500 dark:text-text-secondary'} hover:${colors?.primaryBg || 'bg-primary/20'} hover:${colors?.primary || 'text-primary'} transition-colors`}
                title={`Download ${resource.title}`}
              >
                <Download size={16} />
              </a>
            </>
          )}

          {/* Edit button for CR users if they are the uploader */}
          {user.role === 'CR' && (resource.uploaderEmail === user.email || resource.uploader === user.fullName) && (
            <button
              onClick={() => {
                console.log('Edit button clicked for resource:', resource.id || resource.resourceId);
                onEditResource(resource);
              }}
              className={`p-2 ${colors?.textSecondary || 'text-gray-500 dark:text-text-secondary'} hover:bg-blue-500/20 hover:text-blue-600 transition-colors`}
              title="Edit resource details"
            >
              <Edit size={16} />
            </button>
          )}

          {/* Delete button for CR users if they are the uploader */}
          {user.role === 'CR' && (resource.uploaderEmail === user.email || resource.uploader === user.fullName) && (
            <button
              onClick={() => onDeleteResource(resource)}
              className="p-2 text-gray-500 dark:text-text-secondary hover:text-error transition-colors"
              title="Delete resource"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Folder Content */}
      {isFolder && isExpanded && resource.files && (
        <div className="border-t border-gray-200 dark:border-border-color bg-gray-50 dark:bg-neutral-800">
          <div className="p-4 space-y-2">
            {resource.files.map((file, index) => (
              <div
                key={file.fileId || index}
                className="flex items-center justify-between bg-white dark:bg-surface rounded-lg p-3 border border-gray-200 dark:border-border-color hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileTypeIcon filename={file.fileName} size={24} />
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onViewFile(resource, file)}
                      className="text-sm font-medium text-gray-800 dark:text-text-primary hover:text-primary transition-colors block truncate text-left w-full cursor-pointer"
                    >
                      {file.fileName}
                    </button>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-text-secondary mt-1">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span className="capitalize">{file.fileType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => onViewFile(resource, file)}
                    className="p-1.5 rounded-md text-gray-500 dark:text-text-secondary hover:bg-primary/20 hover:text-primary transition-colors"
                    title={`View ${file.fileName}`}
                  >
                    <Eye size={14} />
                  </button>
                  <a
                    href={file.filePath}
                    download={file.fileName}
                    className="p-1.5 rounded-md text-gray-500 dark:text-text-secondary hover:bg-primary/20 hover:text-primary transition-colors"
                    title={`Download ${file.fileName}`}
                  >
                    <Download size={14} />
                  </a>

                  {/* Remove individual file button for CR users if they are the uploader */}
                  {user.role === 'CR' && (resource.uploaderEmail === user.email || resource.uploader === user.fullName) && (
                    <button
                      onClick={() => onRemoveFile(resourceId, file.fileId)}
                      className="p-1.5 text-gray-500 dark:text-text-secondary hover:text-error transition-colors"
                      title="Remove this file"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add More Files Button for CR users if they are the uploader */}
            {user.role === 'CR' && (resource.uploaderEmail === user.email || resource.uploader === user.fullName) && (
              <div className="flex items-center justify-center pt-3 border-t border-gray-200 dark:border-border-color mt-2">
                <input
                  type="file"
                  multiple
                  accept="*/*"
                  id={`add-files-${resourceId}`}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      onAddMoreFiles(resourceId, Array.from(e.target.files));
                    }
                    e.target.value = ''; // Reset input
                  }}
                />
                <label
                  htmlFor={`add-files-${resourceId}`}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all cursor-pointer text-sm font-medium shadow-sm hover:shadow-md border border-green-500 hover:border-green-600"
                  title="Add more files to this folder"
                >
                  <Plus size={16} />
                  Add More Files
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicResources;
