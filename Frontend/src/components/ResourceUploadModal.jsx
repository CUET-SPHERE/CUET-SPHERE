import React, { useState } from 'react';
import { X, UploadCloud, FileUp, Loader2 } from 'lucide-react';
import ApiService from '../services/api';
import SuccessModal from './SuccessModal';
import FileTypeIcon from './FileTypeIcon';

const ResourceUploadModal = ({ open, onClose, onUpload, course, level, term }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [resourceType, setResourceType] = useState('LECTURE_NOTE');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // Debug: Log the course prop when modal opens
  React.useEffect(() => {
    if (open) {
      console.log('ResourceUploadModal opened with course:', course);
      console.log('Course properties:', course ? Object.keys(course) : 'course is null/undefined');
    }
  }, [open, course]);

  if (!open) return null;

  const validateFile = (selectedFile) => {
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes

    if (!selectedFile) {
      setError('Please select a file');
      return false;
    }

    if (selectedFile.size > maxSize) {
      setError('File size must be less than 100MB');
      return false;
    }

    setError('');
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        e.target.value = ''; // Reset file input
      }
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      setError('Please enter a resource title');
      return;
    }

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!validateFile(file)) {
      return;
    }

    // Validate course code
    const courseCode = course?.code || course?.courseCode;
    if (!courseCode) {
      setError('Course information is missing. Please try again.');
      console.error('Course object:', course);
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadProgress(0);

      // Create resource data
      const resourceData = {
        title: title.trim(),
        description: description.trim(),
        resourceType,
        courseCode: courseCode,
        semesterName: `${level}-${term}`
      };

      console.log('Uploading resource with data:', resourceData);

      // Call the new API to create resource with file
      const result = await ApiService.createResourceWithFile(
        resourceData,
        file,
        (progress) => setUploadProgress(progress)
      );

      // Store result and show success modal
      setUploadResult({
        ...result,
        fileSize: file.size,
        level,
        term,
        courseCode: resourceData.courseCode
      });

      // Call the parent onUpload handler if provided
      if (onUpload) {
        onUpload({
          ...result,
          level,
          term,
          courseCode: resourceData.courseCode
        });
      }

      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      setResourceType('LECTURE_NOTE');
      setUploadProgress(0);

      // Close upload modal and show success modal
      onClose();
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return; // Prevent closing during upload
    setTitle('');
    setDescription('');
    setFile(null);
    setResourceType('LECTURE_NOTE');
    setError('');
    setUploadProgress(0);
    setShowSuccessModal(false);
    setUploadResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-surface rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 border border-border-color">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Upload Resource</h2>
          <button
            onClick={handleClose}
            className="text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
            disabled={uploading}
          >
            <X size={24} />
          </button>
        </div>
        <p className="text-text-secondary mb-4">
          Uploading for: <span className="font-semibold text-primary">{course?.name || course?.courseName}</span> (Level {level}, Term {term})
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-2">Resource Title*</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Midterm Lecture Slides"
              className="w-full bg-background border border-border-color rounded-lg px-4 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
              disabled={uploading}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this resource"
              className="w-full bg-background border border-border-color rounded-lg px-4 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
              rows="3"
              disabled={uploading}
            />
          </div>

          <div>
            <label htmlFor="resourceType" className="block text-sm font-medium text-text-secondary mb-2">Resource Type*</label>
            <select
              id="resourceType"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full bg-background border border-border-color rounded-lg px-4 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
              disabled={uploading}
            >
              <option value="LECTURE_NOTE">Lecture Note</option>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="LAB_MANUAL">Lab Manual</option>
              <option value="BOOK">Book</option>
              <option value="PRESENTATION">Presentation</option>
              <option value="QUESTION_PAPER">Question Paper</option>
              <option value="SOLUTION">Solution</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-text-secondary mb-2">File*</label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border-color px-6 py-10">
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-text-secondary" />
                <div className="mt-4 flex text-sm leading-6 text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className={`relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-surface hover:text-purple-400 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={uploading}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mp3,.wav"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                {file ? (
                  <div className="mt-2 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <FileTypeIcon filename={file.name} size={24} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs leading-5 text-gray-500">Any file type, up to 100MB</p>
                )}

                {uploading && uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1 text-gray-500">{Math.round(uploadProgress)}% uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={handleClose}
            className="px-6 py-2 rounded-lg bg-neutral-600 hover:bg-neutral-500 text-white font-semibold transition-all disabled:opacity-50"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-6 py-2 rounded-lg bg-success hover:bg-emerald-600 text-white font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
            disabled={uploading || !title.trim() || !file}
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FileUp size={18} />
                Upload
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        data={uploadResult}
        type="resource"
      />
    </div>
  );
};

export default ResourceUploadModal;
