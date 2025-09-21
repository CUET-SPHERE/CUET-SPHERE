import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { useResources } from '../contexts/ResourcesContext';
import API from '../services/api';
import ResourceUploadModal from './ResourceUploadModal';
import CourseBatchModal from './CourseBatchModal';
import ConfirmationModal from './ConfirmationModal';
import FileIcon from './FileIcon';
import FileTypeIcon, { FileTypeIconWithName } from './FileTypeIcon';
import FileViewer from './FileViewer';
import FolderSidebar from './FolderSidebar';
import { PlusCircle, Edit, Trash2, Download, ArrowLeft, Star, Eye, ChevronDown, Folder, Plus, ChevronRight, MoreHorizontal, FolderPlus, X, CalendarClock, Calendar, AlertCircle, User } from 'lucide-react';

const departmentMap = {
  '04': 'CSE',
  '01': 'CE',
  '02': 'EEE',
  '03': 'ME',
  '05': 'ETE',
};

// Levels and terms constants
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
  const { resources, toggleFavourite, findFolder, handleUpload: handleResourceUpload, loading: resourcesLoading } = useResources();

  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedTerm, setSelectedTerm] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null); // Stores the current semester for the batch

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

  const [editingCourse, setEditingCourse] = useState(null);
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
  const handleViewFile = (resource) => {
    const fileUrl = resource.fileUrl || resource.file?.url || resource.filePath;
    const fileName = resource.file?.name || resource.fileName || resource.title;

    if (!fileUrl) {
      console.error('No file URL found for resource:', resource);
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
        console.log('Resource object being deleted:', data);
        const resourceId = data.id || data.resourceId;

        if (!resourceId) {
          console.error('No resource ID found. Available properties:', Object.keys(data));
          showErrorNotification('Cannot delete resource: No resource ID found.');
          setConfirmModalOpen(false);
          setDeletingItem(null);
          return;
        }

        console.log('Deleting resource by ID:', resourceId);
        await API.deleteResource(resourceId);

        // Refresh resources to reflect the deletion
        await handleResourceUpload();

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
        setConfirmModalOpen(false);
        setDeletingItem(null);
        return;
      }
    }
    // Deleting files from resources is not implemented in this flow, as it's managed by context now.
    setConfirmModalOpen(false);
    setDeletingItem(null);
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

  const [showFolders, setShowFolders] = useState(false);
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-surface rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col h-full border border-gray-200 dark:border-border-color">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-text-primary">
          Academic Resources
          <span className="block sm:inline text-base font-normal text-gray-500 dark:text-text-secondary ml-0 sm:ml-2">
            ({departmentMap[user.department]} - Batch '{user.batch}')
          </span>
        </h2>
      </div>

      <div className="flex flex-col gap-6 flex-grow overflow-y-auto pr-2">
        {/* Navigation Bar */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-border-color pb-2">
          <div className="flex flex-wrap items-center gap-3">
            {/* Level dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-background rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
                onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
              >
                <span>Level {selectedLevel}</span>
                <ChevronDown size={16} className={`transition-transform ${isLevelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLevelDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-surface border border-gray-200 dark:border-border-color rounded-lg shadow-lg z-10 w-40">
                  {levels.map((level) => (
                    <button
                      key={level}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all ${selectedLevel === level ? 'bg-primary/10 text-primary' : ''}`}
                      onClick={() => {
                        setSelectedLevel(level);
                        setSelectedTerm(1);
                        setSelectedCourse(null);
                        setIsLevelDropdownOpen(false);
                        setShowFolders(false);
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
                    ? 'bg-primary/20 text-primary'
                    : 'bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                  }`}
                title="Go to the ongoing semester"
              >
                <Calendar size={16} className={selectedLevel === currentSemester.level && selectedTerm === currentSemester.term ? 'text-primary' : 'text-amber-600 dark:text-amber-400'} />
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

          <div className="flex">
            <button
              className={`px-4 py-2 font-medium transition-all ${!showFolders ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-text-secondary hover:text-primary'}`}
              onClick={() => setShowFolders(false)}
            >
              Courses
            </button>
            <button
              className={`px-4 py-2 font-medium transition-all flex items-center gap-1 ${showFolders ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-text-secondary hover:text-primary'}`}
              onClick={() => setShowFolders(true)}
            >
              <Folder size={16} className="text-primary" /> Folders
            </button>
          </div>
        </div>

        <div className="w-full flex-grow">
          {showFolders ? (
            <div className="h-full">
              <FolderSidebar />
            </div>
          ) : !selectedCourse ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 sm:gap-4">
                  {terms.map((term) => (
                    <button
                      key={term}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedTerm === term ? 'bg-primary/20 text-primary' : 'bg-gray-100 dark:bg-background text-gray-700 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-neutral-700'}`}
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
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-purple-600 text-white rounded-lg transition-all text-sm font-semibold"
                    disabled={loadingCourses}
                  >
                    <PlusCircle size={18} />
                    <span className="hidden sm:inline">Add Course</span>
                  </button>
                )}
              </div>

              {loadingCourses ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : courseError ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-border-color rounded-lg">
                  <AlertCircle className="mx-auto text-error mb-2" size={24} />
                  <p className="text-error">{courseError}</p>
                  <button
                    onClick={() => {
                      setCourseError(null);
                      setSelectedLevel(selectedLevel);
                      setSelectedTerm(selectedTerm);
                    }}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : currentCourses.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-border-color rounded-lg">
                  <p className="text-gray-500 dark:text-text-secondary">No courses found for this term.</p>
                  {user.role === 'CR' && (
                    <button
                      onClick={() => setCourseBatchModalOpen(true)}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-purple-600 text-white rounded-lg transition-all text-sm font-semibold mx-auto"
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
                          <div className="group p-4 bg-gray-50 dark:bg-background rounded-lg border border-gray-200 dark:border-border-color hover:border-primary transition-all flex justify-between items-center">
                            <button className="text-left w-full" onClick={() => setSelectedCourse(course)}>
                              <p className="font-semibold text-gray-800 dark:text-text-primary">{course.name}</p>
                              <p className="text-sm text-gray-500 dark:text-text-secondary">{course.code}</p>
                            </button>
                            {user.role === 'CR' && (
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setEditingCourse(course);
                                    setCourseBatchModalOpen(true);
                                  }}
                                  className="p-2 text-gray-500 dark:text-text-secondary hover:text-secondary"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => openDeleteModal('course', course)}
                                  className="p-2 text-gray-500 dark:text-text-secondary hover:text-error"
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
                  <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-text-secondary hover:text-primary mb-2" onClick={() => setSelectedCourse(null)}>
                    <ArrowLeft size={16} /> Back to Courses
                  </button>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-text-primary">{selectedCourse.name}</h3>
                  <p className="text-gray-500 dark:text-text-secondary">{selectedCourse.code}</p>
                </div>
                {user.role === 'CR' && (
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-success hover:bg-emerald-600 text-white rounded-lg transition-all text-sm font-semibold"
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : getResourcesForCourse(selectedCourse.code).length > 0 ? (
                  getResourcesForCourse(selectedCourse.code).map((res) => (
                    <div
                      key={res.id || res.resourceId}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, res.id || res.resourceId)}
                      className="flex items-center justify-between bg-gray-100 dark:bg-background rounded-lg p-4 border border-gray-200 dark:border-border-color hover:shadow-md transition-all hover:border-primary"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* File Type Icon */}
                        <FileTypeIcon
                          filename={res.file?.name || res.fileName || res.fileUrl?.split('/').pop() || res.filePath?.split('/').pop() || res.title}
                          size={28}
                        />

                        <div className="flex-1 min-w-0">
                          {/* Resource Title and Link */}
                          <button
                            onClick={() => handleViewFile(res)}
                            className="resource-title-button font-semibold text-gray-800 dark:text-text-primary hover:text-primary transition-colors block truncate text-left w-full cursor-pointer"
                          >
                            {res.title}
                          </button>

                          {/* Resource Description (if available) */}
                          {res.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                              {res.description}
                            </p>
                          )}

                          {/* Uploader Information and Upload Date */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-text-secondary mt-2">
                            <div className="flex items-center gap-1">
                              <User size={12} />
                              <span>
                                Uploaded by: <span className="font-medium">
                                  {res.uploaderName || res.uploader || 'Unknown'}
                                </span>
                                {res.uploaderStudentId && (
                                  <span className="ml-1 text-gray-400">
                                    (ID: {res.uploaderStudentId})
                                  </span>
                                )}
                              </span>
                            </div>

                            <span className="text-gray-300 dark:text-gray-600">•</span>

                            <span>
                              {new Date(res.uploadedAt || res.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>

                            {/* Resource Type */}
                            {res.resourceType && (
                              <>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <span className="capitalize">
                                  {res.resourceType.replace(/_/g, ' ').toLowerCase()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toggleFavourite(res.id || res.resourceId)}
                          className="p-2 text-gray-500 dark:text-text-secondary hover:text-yellow-500 transition-colors"
                          title="Add to favorites"
                        >
                          <Star size={16} className={favouriteResourceIds.includes(res.id || res.resourceId) ? 'text-yellow-500 fill-current' : ''} />
                        </button>
                        <button
                          onClick={() => handleViewFile(res)}
                          className="p-2 rounded-md text-gray-500 dark:text-text-secondary hover:bg-primary/20 hover:text-primary transition-colors"
                          title={`View ${res.title}`}
                        >
                          <Eye size={16} />
                        </button>
                        <a
                          href={res.fileUrl || res.file?.url || res.filePath}
                          download={res.file?.name || res.fileName || res.title}
                          className="p-2 rounded-md text-gray-500 dark:text-text-secondary hover:bg-primary/20 hover:text-primary transition-colors"
                          title={`Download ${res.title}`}
                        >
                          <Download size={16} />
                        </a>

                        {/* Delete button for CR users if they are the uploader */}
                        {user.role === 'CR' && (res.uploaderEmail === user.email || res.uploader === user.fullName) && (
                          <button
                            onClick={() => openDeleteModal('resource', res)}
                            className="p-2 text-gray-500 dark:text-text-secondary hover:text-error transition-colors"
                            title="Delete resource"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
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
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
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

export default AcademicResources;
