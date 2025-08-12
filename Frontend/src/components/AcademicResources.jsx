import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useResources } from '../contexts/ResourcesContext';
import ResourceUploadModal from './ResourceUploadModal';
import CourseModal from './CourseModal';
import ConfirmationModal from './ConfirmationModal';
import FileIcon from './FileIcon';
import { PlusCircle, Edit, Trash2, Download, ArrowLeft, Star } from 'lucide-react';

const departmentMap = {
  '04': 'CSE',
  '01': 'CE',
  '02': 'EEE',
  '03': 'ME',
  '05': 'ETE',
};

const initialCoursesByLevelTerm = {
  1: {
    1: [
      { code: 'CSE-141', name: 'Structured Programming' },
      { code: 'CSE-142', name: 'Structured Programming Lab' },
      { code: 'MAT-141', name: 'Mathematics I' },
      { code: 'PHY-141', name: 'Physics I' },
      { code: 'HUM-141', name: 'English & Economics' },
    ],
    2: [
      { code: 'CSE-143', name: 'Discrete Mathematics' },
      { code: 'MAT-143', name: 'Mathematics II' },
      { code: 'PHY-143', name: 'Physics II' },
      { code: 'CHE-141', name: 'Chemistry' },
      { code: 'ME-143', name: 'Engineering Drawing' },
    ]
  },
  2: { 1: [], 2: [] },
  3: { 1: [], 2: [] },
  4: { 1: [], 2: [] },
};

const levels = [1, 2, 3, 4];
const terms = [1, 2];

function AcademicResources() {
  const { user } = useUser();
  const { resources, toggleFavourite, findFolder, handleUpload: handleResourceUpload } = useResources();
  
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedTerm, setSelectedTerm] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [courses, setCourses] = useState(initialCoursesByLevelTerm);

  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isCourseModalOpen, setCourseModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const favouritesFolder = findFolder('favourites');
  const favouriteResourceIds = favouritesFolder ? favouritesFolder.resourceIds : [];

  const getResourcesForCourse = (courseCode) =>
    resources.filter(
      (r) =>
        r.department === user.department &&
        r.batch === user.batch &&
        r.level === selectedLevel &&
        r.term === selectedTerm &&
        r.courseCode === courseCode
    );

  const handleSaveCourse = (courseData) => {
    setCourses(prev => {
      const newCourses = { ...prev };
      const termCourses = [...newCourses[selectedLevel][selectedTerm]];
      const index = termCourses.findIndex(c => c.code === (editingCourse?.code || courseData.code));
      if (index > -1) termCourses[index] = courseData;
      else termCourses.push(courseData);
      newCourses[selectedLevel][selectedTerm] = termCourses;
      return newCourses;
    });
    setEditingCourse(null);
  };

  const openDeleteModal = (type, data) => {
    setDeletingItem({ type, data });
    setConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingItem) return;
    const { type, data } = deletingItem;
    if (type === 'course') {
      setCourses(prev => {
        const newCourses = { ...prev };
        newCourses[selectedLevel][selectedTerm] = newCourses[selectedLevel][selectedTerm].filter(c => c.code !== data.code);
        return newCourses;
      });
    }
    // Deleting files from resources is not implemented in this flow, as it's managed by context now.
    setConfirmModalOpen(false);
    setDeletingItem(null);
  };
  
  const handleUpload = (newRes) => {
    handleResourceUpload({ ...newRes, courseCode: selectedCourse.code });
  };

  const handleDragStart = (e, resourceId) => {
    e.dataTransfer.setData('resourceId', resourceId);
  };

  const currentCourses = courses[selectedLevel]?.[selectedTerm] || [];
  const midPoint = Math.ceil(currentCourses.length / 2);
  const courseCol1 = currentCourses.slice(0, midPoint);
  const courseCol2 = currentCourses.slice(midPoint);

  return (
    <div className="bg-white dark:bg-surface rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col h-full border border-gray-200 dark:border-border-color">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-text-primary">
          Academic Resources
          <span className="block sm:inline text-base font-normal text-gray-500 dark:text-text-secondary ml-0 sm:ml-2">
            ({departmentMap[user.department]} - Batch '{user.batch})
          </span>
        </h2>
      </div>
      
      <div className="flex flex-col gap-6 flex-grow overflow-y-auto pr-2">
        <div className="grid grid-cols-5 items-center gap-2 sm:gap-4">
          <h3 className="font-semibold text-gray-600 dark:text-text-secondary col-span-1 text-sm sm:text-base">Level</h3>
          <div className="col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {levels.map((level) => (
              <button
                key={level}
                className={`px-3 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${selectedLevel === level ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-background text-gray-700 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-neutral-700'}`}
                onClick={() => { setSelectedLevel(level); setSelectedTerm(1); setSelectedCourse(null); }}
              >
                Level {level}
              </button>
            ))}
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
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedTerm === term ? 'bg-primary/20 text-primary' : 'bg-gray-100 dark:bg-background text-gray-700 dark:text-text-secondary hover:bg-gray-200 dark:hover:bg-neutral-700'}`}
                      onClick={() => { setSelectedTerm(term); setSelectedCourse(null); }}
                    >
                      Term {term}
                    </button>
                  ))}
                </div>
                {user.role === 'CR' && (
                  <button 
                    onClick={() => { setEditingCourse(null); setCourseModalOpen(true); }}
                    className="flex items-center gap-2 px-3 py-2 bg-success hover:bg-emerald-600 text-white rounded-lg transition-all text-sm font-semibold">
                    <PlusCircle size={18} />
                    <span className="hidden sm:inline">Add Course</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[courseCol1, courseCol2].map((col, colIndex) => (
                  <div key={colIndex} className="flex flex-col gap-3">
                    {col.map((course) => (
                      <div key={course.code} className="group p-4 bg-gray-50 dark:bg-background rounded-lg border border-gray-200 dark:border-border-color hover:border-primary transition-all flex justify-between items-center">
                        <button className="text-left w-full" onClick={() => setSelectedCourse(course)}>
                          <p className="font-semibold text-gray-800 dark:text-text-primary">{course.name}</p>
                          <p className="text-sm text-gray-500 dark:text-text-secondary">{course.code}</p>
                        </button>
                        {user.role === 'CR' && (
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingCourse(course); setCourseModalOpen(true); }} className="p-2 text-gray-500 dark:text-text-secondary hover:text-secondary"><Edit size={16} /></button>
                            <button onClick={() => openDeleteModal('course', course)} className="p-2 text-gray-500 dark:text-text-secondary hover:text-error"><Trash2 size={16} /></button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
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
                  <button onClick={() => setUploadModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-success hover:bg-emerald-600 text-white rounded-lg transition-all text-sm font-semibold">
                    <PlusCircle size={18} />
                    <span className="hidden sm:inline">Upload File</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {getResourcesForCourse(selectedCourse.code).length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-border-color rounded-lg">
                    <p className="text-gray-500 dark:text-text-secondary">No resources uploaded for this course yet.</p>
                    {user.role === 'CR' && <p className="text-sm text-gray-500 mt-2">Click 'Upload File' to add the first one.</p>}
                  </div>
                ) : (
                  getResourcesForCourse(selectedCourse.code).map((res) => (
                    <div
                      key={res.id}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, res.id)}
                      className="flex items-center justify-between bg-gray-100 dark:bg-background rounded-lg p-3 border border-gray-200 dark:border-border-color cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-4">
                        <FileIcon fileType={res.file.type} />
                        <div>
                          <a href={res.file.url} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-800 dark:text-text-primary hover:text-primary transition-colors">{res.title}</a>
                          <div className="text-xs text-gray-500 dark:text-text-secondary">Uploaded by: {res.uploader}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleFavourite(res.id)} className="p-2 text-gray-500 dark:text-text-secondary hover:text-yellow-500">
                          <Star size={16} className={favouriteResourceIds.includes(res.id) ? 'text-yellow-500 fill-current' : ''} />
                        </button>
                        <span className="text-xs text-gray-500 dark:text-text-secondary flex items-center gap-1"><Download size={12} /> {res.downloadCount}</span>
                        <a href={res.file.url} download={res.file.name} className="px-3 py-1 bg-primary text-white rounded-md hover:bg-purple-600 transition-all text-sm">Download</a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <CourseModal isOpen={isCourseModalOpen} onClose={() => setCourseModalOpen(false)} onSave={handleSaveCourse} course={editingCourse} />
      <ResourceUploadModal open={isUploadModalOpen} onClose={() => setUploadModalOpen(false)} onUpload={handleUpload} course={selectedCourse?.name} level={selectedLevel} term={selectedTerm} />
      <ConfirmationModal 
        isOpen={isConfirmModalOpen} 
        onClose={() => setConfirmModalOpen(false)} 
        onConfirm={confirmDelete}
        title={`Delete ${deletingItem?.type}`}
        message={`Are you sure you want to permanently delete this ${deletingItem?.type}? This action cannot be undone.`}
      />
    </div>
  );
}

export default AcademicResources;
