import React, { useState } from 'react';
import { postService } from '../services/postService';

function ApiTest() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testGetPosts = async () => {
    setLoading(true);
    setTestResult('Testing GET /api/posts...');
    
    try {
      const posts = await postService.getAllPosts();
      setTestResult(`SUCCESS: Got ${posts.length} posts`);
    } catch (error) {
      setTestResult(`ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreatePost = async () => {
    setLoading(true);
    setTestResult('Testing POST /api/posts...');
    
    try {
      const testPost = {
        title: 'Test Post from Frontend',
        content: 'This is a test post to verify API connectivity',
        tags: ['test', 'frontend'],
        mediaUrl: null,
        userId: 1
      };
      
      const result = await postService.createPost(testPost);
      setTestResult(`SUCCESS: Created post with ID ${result.id}`);
    } catch (error) {
      setTestResult(`ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-100 rounded-lg mb-4">
      <h3 className="font-bold mb-2">API Test Panel</h3>
      <div className="space-y-2">
        <button 
          onClick={testGetPosts}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded mr-2"
        >
          Test GET Posts
        </button>
        <button 
          onClick={testCreatePost}
          disabled={loading}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Test CREATE Post
        </button>
      </div>
      {testResult && (
        <div className="mt-2 p-2 bg-white rounded text-sm">
          <pre>{testResult}</pre>
        </div>
      )}
    </div>
  );
}

export default ApiTest;