import React, { useState } from 'react';
import { Search, Users, User, Dot } from 'lucide-react';
import { mockUsers, searchUsers } from '../mock/mockUsers';
import { getInitials, getAvatarColor } from '../utils/formatters';

// Mini Avatar component for sidebar
function MiniAvatar({ src, name, size = 'sm', isOnline = false }) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm'
  };

  const avatarContent = src ? (
    <img 
      src={src} 
      alt={name}
      className={`${sizeClasses[size]} rounded-full object-cover`}
    />
  ) : (
    <div className={`${sizeClasses[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center text-white font-medium`}>
      {getInitials(name)}
    </div>
  );

  return (
    <div className="relative">
      {avatarContent}
      {isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
}

// Individual user item component
function UserItem({ user, onClick, isActive }) {
  return (
    <button
      onClick={() => onClick(user)}
      className={`w-full p-3 rounded-lg transition-colors text-left ${
        isActive
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <MiniAvatar 
          src={user.profilePicture} 
          name={user.full_name} 
          isOnline={user.isOnline}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{user.full_name}</p>
            {user.role === 'CR' && (
              <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium">
                CR
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.student_id} • {user.department} {user.batch}
          </p>
        </div>
        {user.isOnline && (
          <Dot className="h-4 w-4 text-green-500 flex-shrink-0" />
        )}
      </div>
    </button>
  );
}

function UserSidebar({ onUserClick, selectedUserId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [activeFilter, setActiveFilter] = useState('all');

  const handleSearch = (query) => {
    setSearchQuery(query);
    let users = searchUsers(query);
    
    // Apply additional filters
    if (activeFilter === 'online') {
      users = users.filter(user => user.isOnline);
    } else if (activeFilter === 'cr') {
      users = users.filter(user => user.role === 'CR');
    } else if (activeFilter === 'batch22') {
      users = users.filter(user => user.batch === '22');
    }
    
    setFilteredUsers(users);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    let users = searchUsers(searchQuery);
    
    if (filter === 'online') {
      users = users.filter(user => user.isOnline);
    } else if (filter === 'cr') {
      users = users.filter(user => user.role === 'CR');
    } else if (filter === 'batch22') {
      users = users.filter(user => user.batch === '22');
    }
    
    setFilteredUsers(users);
  };

  const onlineUsers = filteredUsers.filter(user => user.isOnline);
  const offlineUsers = filteredUsers.filter(user => !user.isOnline);

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Students</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">({filteredUsers.length})</span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'All', count: mockUsers.length },
            { key: 'online', label: 'Online', count: mockUsers.filter(u => u.isOnline).length },
            { key: 'cr', label: 'CRs', count: mockUsers.filter(u => u.role === 'CR').length },
            { key: 'batch22', label: 'Batch 22', count: mockUsers.filter(u => u.batch === '22').length }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleFilterChange(filter.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilter === filter.key
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchQuery ? 'No students found' : 'No students available'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Online Users */}
            {onlineUsers.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Online ({onlineUsers.length})
                  </span>
                </div>
                {onlineUsers.map((user) => (
                  <UserItem
                    key={user.id}
                    user={user}
                    onClick={onUserClick}
                    isActive={selectedUserId === user.id}
                  />
                ))}
              </div>
            )}

            {/* Offline Users */}
            {offlineUsers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 px-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Offline ({offlineUsers.length})
                  </span>
                </div>
                {offlineUsers.map((user) => (
                  <UserItem
                    key={user.id}
                    user={user}
                    onClick={onUserClick}
                    isActive={selectedUserId === user.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{mockUsers.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{mockUsers.filter(u => u.isOnline).length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Online</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">{mockUsers.filter(u => u.role === 'CR').length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">CRs</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSidebar;