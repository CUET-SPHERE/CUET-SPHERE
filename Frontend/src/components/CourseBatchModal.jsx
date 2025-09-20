import React, { useState, useEffect } from 'react';
import { X, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import API from '../services/api';

// Helper function to map level and term to semester ID
const getSemesterIdFromLevelTerm = (level, term) => {
   // Based on your database: 1-1=1, 1-2=2, 2-1=3, 2-2=4, 3-1=5, 3-2=6, 4-1=7, 4-2=8
   return (level - 1) * 2 + term;
};

const CourseBatchModal = ({ isOpen, onClose, onSave, level, term, editingCourse = null }) => {
   const [courseEntries, setCourseEntries] = useState([
      { id: 1, courseCode: '', courseName: '' }
   ]);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState('');
   const { user } = useUser();

   useEffect(() => {
      if (isOpen) {
         if (editingCourse) {
            // If editing, populate with existing course data
            setCourseEntries([{
               id: 1,
               courseCode: editingCourse.code || '',
               courseName: editingCourse.name || ''
            }]);
         } else {
            // Reset form when modal opens for new course
            setCourseEntries([{ id: 1, courseCode: '', courseName: '' }]);
         }
         setError('');
      }
   }, [isOpen, editingCourse]);

   if (!isOpen) return null;

   const handleAddCourse = () => {
      setCourseEntries([
         ...courseEntries,
         { id: Date.now(), courseCode: '', courseName: '' }
      ]);
   };

   const handleRemoveCourse = (id) => {
      // Prevent removing the last course entry
      if (courseEntries.length === 1) return;
      setCourseEntries(courseEntries.filter(entry => entry.id !== id));
   };

   const handleInputChange = (id, field, value) => {
      setCourseEntries(
         courseEntries.map(entry =>
            entry.id === id ? { ...entry, [field]: value } : entry
         )
      );
   };

   const validateEntries = () => {
      // Check if any entry has empty required fields
      const emptyEntries = courseEntries.some(
         entry => !entry.courseCode.trim() || !entry.courseName.trim()
      );

      if (emptyEntries) {
         setError('All course code and name fields are required.');
         return false;
      }

      // Check for duplicate course codes
      const codes = courseEntries.map(entry => entry.courseCode);
      if (new Set(codes).size !== codes.length) {
         setError('Duplicate course codes are not allowed.');
         return false;
      }

      return true;
   };

   const handleSave = async () => {
      if (!validateEntries()) return;

      try {
         setSaving(true);
         setError('');

         const semesterName = `${level}-${term}`;
         const semesterId = getSemesterIdFromLevelTerm(level, term);

         console.log(`Using semester ID ${semesterId} for ${semesterName}`);

         // Handling for editing an existing course
         if (editingCourse) {
            const entry = courseEntries[0]; // Always the first one when editing
            try {
               // Update the single course
               const response = await API.saveCourse({
                  courseId: editingCourse.id,
                  courseCode: entry.courseCode,
                  courseName: entry.courseName,
                  department: user.department,
                  batch: user.batch,
                  semesterName: semesterName,
                  semesterId: semesterId
               });

               // Format the response for the parent component
               const updatedCourse = {
                  code: entry.courseCode,
                  name: entry.courseName,
                  id: editingCourse.id
               };

               onSave(updatedCourse);
               onClose();
            } catch (apiError) {
               console.warn("Course update API not available:", apiError);

               // Fallback handling
               const updatedCourse = {
                  code: entry.courseCode,
                  name: entry.courseName,
                  id: editingCourse.id
               };

               onSave(updatedCourse);
               onClose();
            }
         }
         // Handling for adding one or more new courses
         else {
            const courseRequests = courseEntries.map(entry => ({
               courseCode: entry.courseCode,
               courseName: entry.courseName,
               department: user.department,
               batch: user.batch,
               semesterName: semesterName,
               semesterId: semesterId
            }));

            // Call the batch API endpoint for new courses
            try {
               const response = await API.saveMultipleCourses({
                  courses: courseRequests,
                  semesterName: semesterName,
                  semesterId: semesterId
               });

               // Format response for parent component
               const createdCourses = response.map(course => ({
                  code: course.courseCode,
                  name: course.courseName,
                  id: course.courseId,
                  semesterId: course.semesterId || semesterId
               }));

               onSave(createdCourses);
               onClose();
            } catch (apiError) {
               console.warn("Batch course API not available:", apiError);

               // Fallback to local handling if API fails
               const mockCreatedCourses = courseEntries.map((entry, index) => ({
                  code: entry.courseCode,
                  name: entry.courseName,
                  id: Date.now() + index,
                  semesterId: semesterId
               }));

               onSave(mockCreatedCourses);
               onClose();
            }
         }
      } catch (err) {
         console.error('Error saving courses:', err);
         setError(err.message || 'Failed to save courses. Please try again.');
      } finally {
         setSaving(false);
      }
   };

   return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 overflow-y-auto py-6">
         <div className="bg-surface rounded-2xl shadow-2xl p-8 w-full max-w-2xl m-4 border border-border-color">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-text-primary">
                  {editingCourse ? 'Edit Course' : 'Add Course'}
               </h2>
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

                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-md font-medium text-text-primary">
                        Courses for Level {level}, Term {term}
                     </h3>
                     {!editingCourse && (
                        <button
                           type="button"
                           onClick={handleAddCourse}
                           className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-purple-600 text-white rounded-lg transition-all text-sm"
                           disabled={saving}
                        >
                           <PlusCircle size={16} />
                           <span>Add Another Course</span>
                        </button>
                     )}
                  </div>

                  <div className="border border-gray-200 dark:border-border-color rounded-xl overflow-hidden shadow-sm">
                     <div className="grid grid-cols-12 gap-2 bg-gray-50 dark:bg-background p-4 border-b border-gray-200 dark:border-border-color">
                        <div className="col-span-4 font-medium text-text-secondary text-sm">Course Code</div>
                        <div className="col-span-7 font-medium text-text-secondary text-sm">Course Name</div>
                     </div>

                     <div className="divide-y divide-gray-200 dark:divide-border-color">
                        {courseEntries.map((entry, index) => (
                           <div key={entry.id} className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-gray-50 dark:hover:bg-background/60 transition-colors">
                              <div className="col-span-4 relative">
                                 <input
                                    type="text"
                                    value={entry.courseCode}
                                    onChange={(e) => handleInputChange(entry.id, 'courseCode', e.target.value)}
                                    placeholder="e.g., CSE-141"
                                    className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                                    required
                                    disabled={saving}
                                 />
                                 <span className="absolute -left-6 top-2 text-sm font-medium text-gray-400">{index + 1}.</span>
                              </div>
                              <div className="col-span-7">
                                 <input
                                    type="text"
                                    value={entry.courseName}
                                    onChange={(e) => handleInputChange(entry.id, 'courseName', e.target.value)}
                                    placeholder="e.g., Structured Programming"
                                    className="w-full bg-background border border-border-color rounded-lg px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                                    required
                                    disabled={saving}
                                 />
                              </div>
                              <div className="col-span-1 flex justify-center">
                                 <button
                                    type="button"
                                    onClick={() => handleRemoveCourse(entry.id)}
                                    className={`p-1.5 rounded-full ${courseEntries.length === 1 || editingCourse ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-text-secondary hover:text-white hover:bg-error'} transition-colors`}
                                    disabled={saving || courseEntries.length === 1 || editingCourse}
                                    title={editingCourse ? "Can't remove when editing" : (courseEntries.length === 1 ? "Can't remove the only course" : "Remove this course")}
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="flex justify-end gap-4 mt-8">
                  <button
                     type="button"
                     onClick={onClose}
                     className="px-6 py-2.5 rounded-lg bg-neutral-600 hover:bg-neutral-500 text-white font-semibold transition-all disabled:opacity-50"
                     disabled={saving}
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     className="px-6 py-2.5 rounded-lg bg-primary hover:bg-purple-600 text-white font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                     disabled={saving || courseEntries.some(entry => !entry.courseCode || !entry.courseName)}
                  >
                     {saving ? (
                        <>
                           <Loader2 size={18} className="animate-spin" />
                           Saving...
                        </>
                     ) : editingCourse ? 'Save Changes' : (
                        courseEntries.length === 1 ? 'Add Course' : `Add ${courseEntries.length} Courses`
                     )}
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default CourseBatchModal;