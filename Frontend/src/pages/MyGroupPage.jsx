import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { mockGroup } from '../mock/mockGroup';
import { Calendar, Megaphone, Users, TrendingUp, Plus, Clock, MapPin, BookOpen, Send, Paperclip, X, Edit, Trash2 } from 'lucide-react';

function MyGroupPage() {
  const { user, isAuthenticated } = useUser();
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [announcementAttachment, setAnnouncementAttachment] = useState(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [showClassTestForm, setShowClassTestForm] = useState(false);
  const [announcements, setAnnouncements] = useState([
    {
      id: 'mock-1',
      author: 'John Doe',
      role: 'CR',
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      date: '2023-08-13',
      time: '10:00 AM',
      attachment: null,
    },
    ...mockGroup.announcements
  ]);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState({});
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [classTests, setClassTests] = useState(mockGroup.classTests);
  const [newClassTest, setNewClassTest] = useState({
    subject: '',
    date: '',
    time: '',
    syllabus: '',
    duration: ''
  });

  const toggleAnnouncementExpansion = (id) => {
    setExpandedAnnouncements(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAnnouncementEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncement(announcement.message);
    setAnnouncementAttachment(announcement.attachment);
    setIsAnnouncementModalOpen(true);
  };

  const handleAnnouncementDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }
  };

  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const handleAnnouncementSubmit = (e) => {
    e.preventDefault();
    if (newAnnouncement.trim()) {
      const currentDate = new Date();
      const announcement = {
        id: editingAnnouncement ? editingAnnouncement.id : Date.now().toString(),
        author: user.fullName,
        role: user.role,
        message: newAnnouncement.trim(),
        date: currentDate.toISOString().split('T')[0],
        time: currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachment: announcementAttachment,
      };

      setAnnouncements(prev => {
        if (editingAnnouncement) {
          return prev.map(a => a.id === editingAnnouncement.id ? announcement : a);
        }
        return [announcement, ...prev];
      });

      setNewAnnouncement('');
      setAnnouncementAttachment(null);
      setIsAnnouncementModalOpen(false);
      setEditingAnnouncement(null);
    }
  };

  const handleClassTestSubmit = (e) => {
    e.preventDefault();
    if (newClassTest.subject && newClassTest.date) {
      console.log('New class test:', newClassTest);
      setNewClassTest({
        subject: '',
        date: '',
        time: '',
        syllabus: '',
        duration: ''
      });
      setShowClassTestForm(false);
      alert('Class test scheduled successfully!');
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Group Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mockGroup.departmentName || 'Unknown Department'} Batch {mockGroup.batch || '00'}
          </h1>
        </div>

        {/* Desktop Layout - Grid with 4 columns */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-6">
          {/* Left Sidebar - Class Representatives & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Class Representatives */}
            <div className="bg-white dark:bg-surface rounded-lg shadow-sm p-6 border border-gray-200 dark:border-border-color">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-700 dark:text-text-secondary" />
                Class Representatives
              </h2>
              <div className="space-y-4">
                {mockGroup.classRepresentatives.map((rep) => (
                  <div key={rep.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold text-sm">
                      {rep.initials}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-text-primary">{rep.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{rep.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Group Stats */}
            <div className="bg-white dark:bg-surface rounded-lg shadow-sm p-6 border border-gray-200 dark:border-border-color">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-700 dark:text-text-secondary" />
                Group Stats
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total Members</span>
                  <span className="font-semibold text-gray-900 dark:text-text-primary">{mockGroup.memberCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Active This Week</span>
                  <span className="font-semibold text-gray-900 dark:text-text-primary">{mockGroup.activeThisWeek}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Resources Shared</span>
                  <span className="font-semibold text-gray-900 dark:text-text-primary">{mockGroup.resourcesShared}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Announcements</span>
                  <span className="font-semibold text-gray-900 dark:text-text-primary">{mockGroup.announcements.length}</span>
                </div>
              </div>
              <button className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                View group members
              </button>
            </div>
          </div>

          {/* Center - Announcement Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-surface rounded-lg shadow-sm p-6 border border-gray-200 dark:border-border-color">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-4 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-gray-700 dark:text-text-secondary" />
                Announcements
              </h3>
              <div className="h-97 overflow-y-auto scrollbar-hide space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="bg-gray-50 dark:bg-background rounded-lg p-4 border border-gray-200 dark:border-border-color">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold text-xs">
                        {announcement.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-text-primary">{announcement.author}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">({announcement.role})</span>
                          </div>
                          {user.role === 'CR' && announcement.author === user.fullName && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAnnouncementEdit(announcement)}
                                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleAnnouncementDelete(announcement.id)}
                                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-700 dark:text-gray-300 mb-2">
                            {expandedAnnouncements[announcement.id]
                              ? announcement.message
                              : truncateText(announcement.message)}
                          </p>
                          {announcement.message.length > 200 && (
                            <button
                              onClick={() => toggleAnnouncementExpansion(announcement.id)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm mb-2"
                            >
                              {expandedAnnouncements[announcement.id] ? 'See less' : 'See more'}
                            </button>
                          )}
                          {announcement.attachment && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
                              <Paperclip size={14} />
                              <a
                                href={announcement.attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                Attachment
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {announcement.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {announcement.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - CR Management */}
          <div className="lg:col-span-1 space-y-6">
            {/* Right Sidebar - CR Management */}
            {user && user.role === 'CR' && (
              <div className="bg-white dark:bg-surface rounded-lg shadow-sm p-6 border border-gray-200 dark:border-border-color">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-4 flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-gray-700 dark:text-text-secondary" />
                  CR Actions
                </h3>

                <button
                  onClick={() => setIsAnnouncementModalOpen(true)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 mb-4"
                >
                  <Plus className="h-4 w-4" />
                  Make Announcement
                </button>

                {!showClassTestForm ? (
                  <button
                    onClick={() => setShowClassTestForm(true)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Class Test
                  </button>
                ) : (
                  <form onSubmit={handleClassTestSubmit} className="space-y-3">
                    <input
                      type="text"
                      value={newClassTest.subject}
                      onChange={(e) => setNewClassTest({ ...newClassTest, subject: e.target.value })}
                      placeholder="Subject"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-background text-gray-900 dark:text-text-primary"
                      required
                    />
                    <input
                      type="date"
                      value={newClassTest.date}
                      onChange={(e) => setNewClassTest({ ...newClassTest, date: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-background text-gray-900 dark:text-text-primary"
                      required
                    />
                    <input
                      type="time"
                      value={newClassTest.time}
                      onChange={(e) => setNewClassTest({ ...newClassTest, time: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-background text-gray-900 dark:text-text-primary"
                    />
                    <textarea
                      value={newClassTest.syllabus}
                      onChange={(e) => setNewClassTest({ ...newClassTest, syllabus: e.target.value })}
                      placeholder="Syllabus"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm h-16 resize-none bg-white dark:bg-background text-gray-900 dark:text-text-primary"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Add Test
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowClassTestForm(false);
                          setNewClassTest({
                            subject: '',
                            date: '',
                            time: '',
                            syllabus: '',
                            duration: ''
                          });
                        }}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Upcoming Class Tests */}
            <div className="bg-white dark:bg-surface rounded-lg shadow-sm p-6 border border-gray-200 dark:border-border-color">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-700 dark:text-text-secondary" />
                Upcoming Tests
              </h3>
              <div className="space-y-3">
                {mockGroup.classTests.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming tests.</p>
                ) : (
                  mockGroup.classTests.map((test, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-background rounded-lg p-3 border border-gray-200 dark:border-border-color">
                      <div className="font-medium text-gray-900 dark:text-text-primary text-sm">{test.subject}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Duration: {test.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {test.date} at {test.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {test.syllabus}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Responsive Layout - Stack components in specific order */}
        <div className="lg:hidden space-y-6">
          {/* 1. CR Actions (only visible for CR users) */}
          {user && user.role === 'CR' && (
            <div className="bg-white dark:bg-surface rounded-lg shadow-sm p-6 border border-gray-200 dark:border-border-color">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-4 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-gray-700 dark:text-text-secondary" />
                CR Actions
              </h3>

              <button
                onClick={() => setIsAnnouncementModalOpen(true)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 mb-4"
              >
                <Plus className="h-4 w-4" />
                Make Announcement
              </button>

              {!showClassTestForm ? (
                <button
                  onClick={() => setShowClassTestForm(true)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Class Test
                </button>
              ) : (
                <form onSubmit={handleClassTestSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={newClassTest.subject}
                    onChange={(e) => setNewClassTest({ ...newClassTest, subject: e.target.value })}
                    placeholder="Subject"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-background text-gray-900 dark:text-text-primary"
                    required
                  />
                  <input
                    type="date"
                    value={newClassTest.date}
                    onChange={(e) => setNewClassTest({ ...newClassTest, date: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-background text-gray-900 dark:text-text-primary"
                    required
                  />
                  <input
                    type="time"
                    value={newClassTest.time}
                    onChange={(e) => setNewClassTest({ ...newClassTest, time: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-background text-gray-900 dark:text-text-primary"
                  />
                  <textarea
                    value={newClassTest.syllabus}
                    onChange={(e) => setNewClassTest({ ...newClassTest, syllabus: e.target.value })}
                    placeholder="Syllabus"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm h-16 resize-none bg-white dark:bg-background text-gray-900 dark:text-text-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Add Test
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowClassTestForm(false);
                        setNewClassTest({
                          subject: '',
                          date: '',
                          time: '',
                          syllabus: '',
                          duration: ''
                        });
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 2. Upcoming Tests */}
          <div className="bg-white dark:bg-surface rounded-lg shadow-sm p-6 border border-gray-200 dark:border-border-color">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-700 dark:text-text-secondary" />
              Upcoming Tests
            </h3>
            <div className="space-y-3">
              {mockGroup.classTests.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming tests.</p>
              ) : (
                mockGroup.classTests.map((test, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-background rounded-lg p-3 border border-gray-200 dark:border-border-color">
                    <div className="font-medium text-gray-900 dark:text-text-primary text-sm">{test.subject}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Duration: {test.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {test.date} at {test.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {test.syllabus}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Announcements */}
          <div className="bg-white dark:bg-surface rounded-lg shadow-sm p-6 border border-gray-200 dark:border-border-color">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-4 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-gray-700 dark:text-text-secondary" />
              Announcements
            </h3>
            <div className="max-h-96 overflow-y-auto scrollbar-hide space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="bg-gray-50 dark:bg-background rounded-lg p-4 border border-gray-200 dark:border-border-color">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold text-xs">
                      {announcement.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-text-primary">{announcement.author}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">({announcement.role})</span>
                        </div>
                        {user.role === 'CR' && announcement.author === user.fullName && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAnnouncementEdit(announcement)}
                              className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleAnnouncementDelete(announcement.id)}
                              className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          {expandedAnnouncements[announcement.id]
                            ? announcement.message
                            : truncateText(announcement.message)}
                        </p>
                        {announcement.message.length > 200 && (
                          <button
                            onClick={() => toggleAnnouncementExpansion(announcement.id)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm mb-2"
                          >
                            {expandedAnnouncements[announcement.id] ? 'See less' : 'See more'}
                          </button>
                        )}
                        {announcement.attachment && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <Paperclip size={14} />
                            <a
                              href={announcement.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              Attachment
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {announcement.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {announcement.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. View Group Members */}
          <div className="bg-white dark:bg-surface rounded-lg shadow-sm p-6 border border-gray-200 dark:border-border-color">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-700 dark:text-text-secondary" />
              Group Stats
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Total Members</span>
                <span className="font-semibold text-gray-900 dark:text-text-primary">{mockGroup.memberCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Active This Week</span>
                <span className="font-semibold text-gray-900 dark:text-text-primary">{mockGroup.activeThisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Resources Shared</span>
                <span className="font-semibold text-gray-900 dark:text-text-primary">{mockGroup.resourcesShared}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Announcements</span>
                <span className="font-semibold text-gray-900 dark:text-text-primary">{mockGroup.announcements.length}</span>
              </div>
            </div>
            <button className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              View group members
            </button>
          </div>

          {/* 5. Class Representatives */}
          <div className="bg-white dark:bg-surface rounded-lg shadow-sm p-6 border border-gray-200 dark:border-border-color">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-700 dark:text-text-secondary" />
              Class Representatives
            </h2>
            <div className="space-y-4">
              {mockGroup.classRepresentatives.map((rep) => (
                <div key={rep.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold text-sm">
                    {rep.initials}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-text-primary">{rep.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{rep.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Modal */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-border-color">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary">Make an Announcement</h3>
              <button onClick={() => setIsAnnouncementModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
              <div>
                <label htmlFor="announcement-content" className="sr-only">Announcement Content</label>
                <textarea
                  id="announcement-content"
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  placeholder="Write your announcement here..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-y h-32 text-sm bg-white dark:bg-background text-gray-900 dark:text-text-primary focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="announcement-attachment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attach File (Optional)</label>
                <input
                  type="file"
                  id="announcement-attachment"
                  onChange={(e) => setAnnouncementAttachment(e.target.files[0])}
                  className="w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800
                  "
                />
                {announcementAttachment && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Paperclip size={14} /> {announcementAttachment.name}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAnnouncementModalOpen(false);
                    setNewAnnouncement('');
                    setAnnouncementAttachment(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Send size={16} />
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default MyGroupPage;
