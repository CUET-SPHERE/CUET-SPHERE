import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import API from '../services/api';

// Helper function to map level and term to semester ID
const getSemesterIdFromLevelTerm = (level, term) => {
  // Based on your database: 1-1=1, 1-2=2, 2-1=3, 2-2=4, 3-1=5, 3-2=6, 4-1=7, 4-2=8
  return (level - 1) * 2 + term;
};

const CourseModal = ({ isOpen, onClose, onSave, course, level, term }) => {
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user } = useUser();

  useEffect(() => {
    if (course) {
      setCourseName(course.name);
      setCourseCode(course.code);
    } else {
      setCourseName('');
      setCourseCode('');
    }
    setError('');
  }, [course, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (courseName && courseCode) {
      try {
        setSaving(true);
        setError('');

        // Calculate semester ID based on level and term
        const semesterName = `${level}-${term}`;
        const semesterId = getSemesterIdFromLevelTerm(level, term);

        console.log(`Using semester ID ${semesterId} for ${semesterName}`);

        // Now save the course with semester ID
        try {
          // Attempt to save the course to the backend
          const response = await API.saveCourse({
            courseName,
            courseCode,
            department: user.department,
            batch: user.batch,
            semesterName: semesterName,
            semesterId: semesterId
          });

          // If successful, call the onSave function with the saved course
          onSave({
            ...course,
            name: courseName,
            code: courseCode,
            id: response.courseId
          });
        } catch (apiError) {
          console.warn("Course API not available:", apiError);
          // Fallback to local handling
          onSave({ ...course, name: courseName, code: courseCode });
        }

        onClose();
      } catch (err) {
        console.error('Error saving course:', err);
        setError(err.message || 'Failed to save course. Please try again.');
      } finally {
        setSaving(false);
      }
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
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="courseCode" className="block text-sm font-medium text-text-secondary mb-2">Course Code*</label>
              <input
                type="text"
                id="courseCode"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g., CSE-141"
                className="w-full bg-background border border-border-color rounded-lg px-4 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                required
                disabled={saving}
              />
            </div>
            <div>
              <label htmlFor="courseName" className="block text-sm font-medium text-text-secondary mb-2">Course Name*</label>
              <input
                type="text"
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., Structured Programming"
                className="w-full bg-background border border-border-color rounded-lg px-4 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                required
                disabled={saving}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-neutral-600 hover:bg-neutral-500 text-white font-semibold transition-all disabled:opacity-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-primary hover:bg-purple-600 text-white font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
              disabled={saving || !courseName || !courseCode}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : course ? 'Save Changes' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
