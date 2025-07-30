import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { mockGroup } from '../mock/mockGroup';
import { Megaphone, Calendar, Users, TrendingUp, Plus, Clock, MapPin, BookOpen, Send } from 'lucide-react';

function MyGroupPage() {
  const { user, isAuthenticated } = useUser();
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showClassTestForm, setShowClassTestForm] = useState(false);
  const [newClassTest, setNewClassTest] = useState({
    subject: '',
    date: '',
    time: '',
    syllabus: '',
    room: '',
    duration: ''
  });

  const handleAnnouncementSubmit = (e) => {
    e.preventDefault();
    if (newAnnouncement.trim()) {
      // In real app, this would make an API call
      console.log('New announcement:', newAnnouncement);
      setNewAnnouncement('');
      setShowAnnouncementForm(false);
      alert('Announcement posted successfully!');
    }
  };

  const handleClassTestSubmit = (e) => {
    e.preventDefault();
    if (newClassTest.subject && newClassTest.date) {
      // In real app, this would make an API call
      console.log('New class test:', newClassTest);
      setNewClassTest({
        subject: '',
        date: '',
        time: '',
        syllabus: '',
        room: '',
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Group Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {mockGroup.departmentName || 'Unknown Department'} Batch {mockGroup.batch || '00'}
          </h1>
         
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Class Representatives & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Class Representatives */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Class Representatives
              </h2>
              <div className="space-y-4">
                {mockGroup.classRepresentatives.map((rep) => (
                  <div key={rep.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {rep.initials}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{rep.name}</div>
                      <div className="text-sm text-gray-500">{rep.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Group Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Group Stats
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Members</span>
                  <span className="font-semibold text-gray-900">{mockGroup.memberCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active This Week</span>
                  <span className="font-semibold text-gray-900">{mockGroup.activeThisWeek}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Resources Shared</span>
                  <span className="font-semibold text-gray-900">{mockGroup.resourcesShared}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Announcements</span>
                  <span className="font-semibold text-gray-900">{mockGroup.announcements.length}</span>
                </div>
              </div>
              <button className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                View group members
              </button>
            </div>
          </div>

          {/* Center - Announcement Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Announcements
              </h3>
              <div className="h-97 overflow-y-auto scrollbar-hide space-y-4">
                {mockGroup.announcements.map((announcement) => (
                  <div key={announcement.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                        {announcement.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{announcement.author}</span>
                          <span className="text-xs text-gray-500">({announcement.role})</span>
                        </div>
                        <p className="text-gray-700 mb-2">{announcement.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  CR Actions
                </h3>
                
                {!showAnnouncementForm ? (
                  <button 
                    onClick={() => setShowAnnouncementForm(true)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 mb-4"
                  >
                    <Plus className="h-4 w-4" />
                    Make Announcement
                  </button>
                ) : (
                  <form onSubmit={handleAnnouncementSubmit} className="mb-4">
                    <textarea
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      placeholder="Write your announcement..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 text-sm"
                      required
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <Send className="h-3 w-3" />
                        Post
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAnnouncementForm(false);
                          setNewAnnouncement('');
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

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
                      onChange={(e) => setNewClassTest({...newClassTest, subject: e.target.value})}
                      placeholder="Subject"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      required
                    />
                    <input
                      type="date"
                      value={newClassTest.date}
                      onChange={(e) => setNewClassTest({...newClassTest, date: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      required
                    />
                    <input
                      type="time"
                      value={newClassTest.time}
                      onChange={(e) => setNewClassTest({...newClassTest, time: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={newClassTest.room}
                      onChange={(e) => setNewClassTest({...newClassTest, room: e.target.value})}
                      placeholder="Room"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <textarea
                      value={newClassTest.syllabus}
                      onChange={(e) => setNewClassTest({...newClassTest, syllabus: e.target.value})}
                      placeholder="Syllabus"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm h-16 resize-none"
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
                            room: '',
                            duration: ''
                          });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
            
            {/* Upcoming Class Tests */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Tests
              </h3>
              <div className="space-y-3">
                {mockGroup.classTests.length === 0 ? (
                  <p className="text-gray-500 text-sm">No upcoming tests.</p>
                ) : (
                  mockGroup.classTests.map((test, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                      <div className="font-medium text-gray-900 text-sm">{test.subject}</div>
                      <div className="text-xs text-gray-500 mt-1 space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Duration: {test.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {test.date} at {test.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {test.room}
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
      </div>

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