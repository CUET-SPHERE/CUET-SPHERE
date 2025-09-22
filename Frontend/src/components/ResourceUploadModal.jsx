import React, { useState } from 'react';
import { X, UploadCloud, FileUp, Loader2, Folder, File, Trash2, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/api';
import SuccessModal from './SuccessModal';
import FileTypeIcon from './FileTypeIcon';

const ResourceUploadModal = ({ open, onClose, onUpload, course, level, term }) => {
  const { colors, buttonClasses, isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [resourceType, setResourceType] = useState('LECTURE_NOTE');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'folder'

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

  const validateFiles = (selectedFiles) => {
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes

    if (!selectedFiles || selectedFiles.length === 0) {
      setError('Please select at least one file');
      return false;
    }

    for (let file of selectedFiles) {
      if (file.size > maxSize) {
        setError(`File "${file.name}" is too large. Maximum size is 100MB.`);
        return false;
      }
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

  const handleMultipleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      if (validateFiles(selectedFiles)) {
        setFiles(selectedFiles);
      } else {
        e.target.value = ''; // Reset file input
      }
    }
  };

  const removeFileFromList = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (updatedFiles.length === 0) {
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      setError('Please enter a resource title');
      return;
    }

    // Validate based on upload mode
    if (uploadMode === 'single') {
      if (!file) {
        setError('Please select a file to upload');
        return;
      }
      if (!validateFile(file)) {
        return;
      }
    } else { // folder mode
      if (!files || files.length === 0) {
        setError('Please select at least one file to upload');
        return;
      }
      if (!validateFiles(files)) {
        return;
      }
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
      console.log('Upload mode:', uploadMode);

      let result;
      if (uploadMode === 'single') {
        // Call the existing single file API
        result = await ApiService.createResourceWithFile(
          resourceData,
          file,
          (progress) => setUploadProgress(progress)
        );
      } else {
        // Call the new multiple files API
        result = await ApiService.createResourceWithMultipleFiles(
          resourceData,
          files,
          (progress) => setUploadProgress(progress)
        );
      }

      // Store result and show success modal
      setUploadResult({
        ...result,
        fileSize: uploadMode === 'single' ? file.size : files.reduce((total, f) => total + f.size, 0),
        fileCount: uploadMode === 'single' ? 1 : files.length,
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
      setFiles([]);
      setResourceType('LECTURE_NOTE');
      setUploadProgress(0);
      setUploadMode('single');

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
    setFiles([]);
    setResourceType('LECTURE_NOTE');
    setError('');
    setUploadProgress(0);
    setShowSuccessModal(false);
    setUploadResult(null);
    setUploadMode('single');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className={`${colors?.surface || 'bg-surface'} rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${colors?.border || 'border-border-color'} border`}>
        <div className={`sticky top-0 ${colors?.surface || 'bg-surface'} ${colors?.border || 'border-border-color'} border-b px-8 py-6 rounded-t-2xl`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${colors?.textPrimary || 'text-text-primary'}`}>Upload Resource</h2>
            <button
              onClick={handleClose}
              className={`${colors?.textSecondary || 'text-text-secondary'} hover:${colors?.textPrimary || 'text-text-primary'} transition-colors disabled:opacity-50`}
              disabled={uploading}
            >
              <X size={24} />
            </button>
          </div>
          <p className={`${colors?.textSecondary || 'text-text-secondary'} mt-2`}>
            Uploading for: <span className={`font-semibold ${colors?.primary || 'text-primary'}`}>{course?.name || course?.courseName}</span> (Level {level}, Term {term})
          </p>
        </div>

        <div className="px-8 py-6">
          {error && (
            <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              {/* Upload Mode Selection */}
              <div>
                <label className={`block text-sm font-medium ${colors?.textSecondary || 'text-text-secondary'} mb-3`}>Upload Mode*</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="uploadMode"
                      value="single"
                      checked={uploadMode === 'single'}
                      onChange={(e) => {
                        setUploadMode(e.target.value);
                        setFile(null);
                        setFiles([]);
                        setError('');
                      }}
                      disabled={uploading}
                      className={`${colors?.primary || 'text-blue-600'} focus:ring-blue-500`}
                    />
                    <File size={20} className={`${colors?.textSecondary || 'text-text-secondary'}`} />
                    <span className={`${colors?.textPrimary || 'text-text-primary'}`}>Single File</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="uploadMode"
                      value="folder"
                      checked={uploadMode === 'folder'}
                      onChange={(e) => {
                        setUploadMode(e.target.value);
                        setFile(null);
                        setFiles([]);
                        setError('');
                      }}
                      disabled={uploading}
                      className={`${colors?.primary || 'text-blue-600'} focus:ring-blue-500`}
                    />
                    <Folder size={20} className={`${colors?.textSecondary || 'text-text-secondary'}`} />
                    <span className={`${colors?.textPrimary || 'text-text-primary'}`}>Multiple Files (Folder)</span>
                  </label>
                </div>
                {uploadMode === 'folder' && (
                  <p className={`mt-2 text-xs ${colors?.textSecondary || 'text-text-secondary'}`}>
                    Upload multiple files that will be grouped together under a single resource title.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="title" className={`block text-sm font-medium ${colors?.textSecondary || 'text-text-secondary'} mb-2`}>Resource Title*</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Midterm Lecture Slides"
                  className={`w-full ${colors?.inputBackground || 'bg-background'} ${colors?.border || 'border-border-color'} border rounded-lg px-4 py-2 ${colors?.textPrimary || 'text-text-primary'} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                  disabled={uploading}
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className={`block text-sm font-medium ${colors?.textSecondary || 'text-text-secondary'} mb-2`}>Description (Optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this resource"
                  className={`w-full ${colors?.inputBackground || 'bg-background'} ${colors?.border || 'border-border-color'} border rounded-lg px-4 py-2 ${colors?.textPrimary || 'text-text-primary'} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                  rows="3"
                  disabled={uploading}
                />
              </div>

              <div>
                <label htmlFor="resourceType" className={`block text-sm font-medium ${colors?.textSecondary || 'text-text-secondary'} mb-2`}>Resource Type*</label>
                <select
                  id="resourceType"
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className={`w-full ${colors?.inputBackground || 'bg-background'} ${colors?.border || 'border-border-color'} border rounded-lg px-4 py-2 ${colors?.textPrimary || 'text-text-primary'} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
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
            </div>

            {/* Right Column - File Upload */}
            <div className="space-y-6">
              <div>
                <label htmlFor="file" className={`block text-sm font-medium ${colors?.textSecondary || 'text-text-secondary'} mb-2`}>
                  {uploadMode === 'single' ? 'File*' : 'Files*'}
                </label>
                <div className="border border-dashed border-border-color rounded-lg p-6">
                  <div className="text-center">
                    {uploadMode === 'single' ? (
                      <File className="mx-auto h-12 w-12 text-text-secondary mb-4" />
                    ) : (
                      <Folder className="mx-auto h-12 w-12 text-text-secondary mb-4" />
                    )}
                    <div className="flex text-sm leading-6 text-gray-400 justify-center">
                      <label
                        htmlFor="file-upload"
                        className={`relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-surface hover:text-purple-400 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span>{uploadMode === 'single' ? 'Upload a file' : 'Upload files'}</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={uploadMode === 'single' ? handleFileChange : handleMultipleFileChange}
                          disabled={uploading}
                          multiple={uploadMode === 'folder'}
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mp3,.wav"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>

                    {uploadMode === 'single' ? (
                      // Single file display
                      file ? (
                        <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                          <FileTypeIcon filename={file.name} size={24} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs leading-5 text-gray-500 mt-2">Any file type, up to 100MB</p>
                      )
                    ) : (
                      // Multiple files display
                      files.length > 0 ? (
                        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                              <FileTypeIcon filename={file.name} size={20} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                              <button
                                onClick={() => removeFileFromList(index)}
                                disabled={uploading}
                                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          <div className="text-xs text-gray-500 pt-2 border-t">
                            Total: {files.length} files, {(files.reduce((total, f) => total + f.size, 0) / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs leading-5 text-gray-500 mt-2">Select multiple files, up to 100MB each</p>
                      )
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
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className={`sticky bottom-0 ${colors?.surface || 'bg-surface'} ${colors?.border || 'border-border-color'} border-t px-8 py-6 rounded-b-2xl`}>
          <div className="flex justify-end gap-4">
            <button
              onClick={handleClose}
              className={`${buttonClasses?.secondary || 'px-6 py-2 rounded-lg bg-neutral-600 hover:bg-neutral-500 text-white'} font-semibold transition-all disabled:opacity-50`}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              className={`${buttonClasses?.success || 'px-6 py-2 rounded-lg bg-success hover:bg-emerald-600 text-white'} font-semibold transition-all flex items-center gap-2 disabled:opacity-50`}
              disabled={uploading || !title.trim() || (uploadMode === 'single' ? !file : files.length === 0)}
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  {uploadMode === 'single' ? <FileUp size={18} /> : <Folder size={18} />}
                  {uploadMode === 'single' ? 'Upload' : `Upload ${files.length} Files`}
                </>
              )}
            </button>
          </div>
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
