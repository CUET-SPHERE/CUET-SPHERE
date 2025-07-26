import React, { useState } from 'react';

function ResourceUploadModal({ open, onClose, onUpload, course, level, term }) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !file) {
      setError('Please provide a title and select a file.');
      return;
    }
    // Mock upload: just pass the data back
    onUpload({
      title,
      file: file.name,
      course,
      level,
      term,
      // department, batch, uploader, etc. will be filled in parent
    });
    setTitle('');
    setFile(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Upload Resource for {course}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">File</label>
            <input
              type="file"
              className="w-full"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Upload</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResourceUploadModal; 