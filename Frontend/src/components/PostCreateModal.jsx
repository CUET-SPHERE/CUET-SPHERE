import React, { useState } from 'react';

const categories = ['Help', 'Resource', 'Question', 'Announcement'];

function PostCreateModal({ open, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Title and content are required.');
      return;
    }
    onCreate({
      title,
      content,
      category,
      attachment: file ? file.name : null,
    });
    setTitle('');
    setContent('');
    setCategory(categories[0]);
    setFile(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Post</h2>
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
            <label className="block font-medium mb-1">Content</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Category</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Attachment (optional)</label>
            <input
              type="file"
              className="w-full"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Post</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostCreateModal; 