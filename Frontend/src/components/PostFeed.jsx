import React, { useState } from 'react';
import { mockPosts as initialMockPosts } from '../mock/mockPosts';
import PostCard from './PostCard';
import PostCreateModal from './PostCreateModal';
import { mockUser } from '../mock/mockUser';

const categories = ['All', 'Help', 'Resource', 'Question', 'Announcement'];

function PostFeed() {
  const [posts, setPosts] = useState(initialMockPosts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filtered posts (UI only, logic can be added later)
  const filteredPosts = posts.filter(
    (post) =>
      (selectedCategory === 'All' || post.category === selectedCategory) &&
      (search === '' || post.title.toLowerCase().includes(search.toLowerCase()) || post.content.toLowerCase().includes(search.toLowerCase()))
  );

  // Handle new post creation (mock logic)
  const handleCreatePost = (newPost) => {
    setPosts([
      {
        id: posts.length + 1,
        author: mockUser.full_name,
        authorEmail: mockUser.email,
        timestamp: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        commentsCount: 0,
        bookmarked: false,
        ...newPost,
      },
      ...posts,
    ]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Post Feed</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => setShowCreateModal(true)}>Create Post</button>
      </div>
      <div className="flex gap-4 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              selectedCategory === cat ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
        <input
          type="text"
          className="ml-auto px-3 py-1 border rounded-lg"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <p className="text-gray-500">No posts found.</p>
        ) : (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
      <PostCreateModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreatePost} />
    </div>
  );
}

export default PostFeed; 