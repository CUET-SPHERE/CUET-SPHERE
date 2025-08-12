import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CourseModal = ({ isOpen, onClose, onSave, course }) => {
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');

  useEffect(() => {
    if (course) {
      setCourseName(course.name);
      setCourseCode(course.code);
    } else {
      setCourseName('');
      setCourseCode('');
    }
  }, [course, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (courseName && courseCode) {
      onSave({ ...course, name: courseName, code: courseCode });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-surface rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 border border-border-color">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">{course ? 'Edit Course' : 'Add New Course'}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-6">
            <div>
              <label htmlFor="courseCode" className="block text-sm font-medium text-text-secondary mb-2">Course Code</label>
              <input
                type="text"
                id="courseCode"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g., CSE-141"
                className="w-full bg-background border border-border-color rounded-lg px-4 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="courseName" className="block text-sm font-medium text-text-secondary mb-2">Course Name</label>
              <input
                type="text"
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., Structured Programming"
                className="w-full bg-background border border-border-color rounded-lg px-4 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-neutral-600 hover:bg-neutral-500 text-white font-semibold transition-all">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-primary hover:bg-purple-600 text-white font-semibold transition-all">
              {course ? 'Save Changes' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
