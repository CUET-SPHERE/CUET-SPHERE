import React, { useState } from 'react';
import { X, UploadCloud } from 'lucide-react';

const ResourceUploadModal = ({ open, onClose, onUpload, course, level, term }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  if (!open) return null;

  const handleUpload = () => {
    if (title && file) {
      onUpload({ title, file, course, level, term });
      setTitle('');
      setFile(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-surface rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 border border-border-color">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Upload Resource</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X size={24} />
          </button>
        </div>
        <p className="text-text-secondary mb-4">
          Uploading for: <span className="font-semibold text-primary">{course}</span> (Level {level}, Term {term})
        </p>
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-2">Resource Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Midterm Lecture Slides"
              className="w-full bg-background border border-border-color rounded-lg px-4 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-text-secondary mb-2">File</label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border-color px-6 py-10">
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-text-secondary" />
                <div className="mt-4 flex text-sm leading-6 text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-surface hover:text-purple-400"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files[0])} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                {file ? (
                  <p className="text-xs leading-5 text-text-secondary mt-2">{file.name}</p>
                ) : (
                  <p className="text-xs leading-5 text-gray-500">Any file type, up to 10MB</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-neutral-600 hover:bg-neutral-500 text-white font-semibold transition-all">
            Cancel
          </button>
          <button onClick={handleUpload} className="px-6 py-2 rounded-lg bg-success hover:bg-emerald-600 text-white font-semibold transition-all flex items-center gap-2">
            <UploadCloud size={18} />
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceUploadModal;
