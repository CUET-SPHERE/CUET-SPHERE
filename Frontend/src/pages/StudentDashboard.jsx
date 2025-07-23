import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Star, LogOut, Sun, Moon, Plus, Hand } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

// Mock user data
const mockUser = {
  fullName: 'Muhammad Rony',
  studentId: '2204005',
  department: 'CSE',
  batch: '2022-2023'
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const { login, isAuthenticated, logout } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Temporary: Auto-login for testing purposes
  React.useEffect(() => {
    if (!isAuthenticated) {
      login({
        fullName: 'Muhammad Rony',
        studentId: '2204005',
        email: 'rony@student.cuet.ac.bd',
        department: 'Computer Science & Engineering',
        batch: '2022-2023',
        hall: 'Bangabandhu Sheikh Mujibur Rahman Hall'
      });
    }
  }, [isAuthenticated, login]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Enhanced Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-32 bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col items-center py-8 space-y-8">
          {/* CUETSphere Branding - Horizontal */}
          <Link to="/" onClick={() => navigate('/')} className="cursor-pointer text-white font-bold text-lg text-center px-2 flex flex-col items-center space-y-0">
            <span className="text-xl mb-1">CUET</span>
            <span className="text-sm font-medium">Sphere</span>
          </Link>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-4 text-white hover:bg-blue-600/50 rounded-xl transition-all duration-200 backdrop-blur-sm"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>

          {/* Navigation Icons */}
          <div className="flex flex-col space-y-6">
            <button className="p-4 text-white hover:bg-blue-600/50 rounded-xl transition-all duration-200 backdrop-blur-sm" title="Settings">
              <Settings className="h-6 w-6" />
            </button>
            <button className="p-4 text-white hover:bg-blue-600/50 rounded-xl transition-all duration-200 backdrop-blur-sm" title="Favorites">
              <Star className="h-6 w-6" />
            </button>
            <button onClick={() => { logout(); navigate('/'); }} className="p-4 text-white hover:bg-blue-600/50 rounded-xl transition-all duration-200 backdrop-blur-sm" title="Logout">
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 dark:text-gray-300"
          >
            <Settings className="h-6 w-6" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-4 lg:p-6 space-y-6">
          {/* User Info as Text - Gorgeous Display */}
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  <span className="text-white font-bold text-xl">
                    {mockUser.fullName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{mockUser.fullName}</h1>
                  <p className="text-blue-100">Student ID: {mockUser.studentId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100">Department</p>
                <p className="text-xl font-semibold">{mockUser.department}</p>
                <p className="text-sm text-blue-200">Batch {mockUser.batch}</p>
              </div>
            </div>
          </div>

          {/* Top Section - 3 Equal Height Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DepartmentalGroupCard />
            <WeekScheduleCard />
            <NotificationsCard />
          </div>

          {/* Second Section - Browse Feed + Academic Resources */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Browse Feed Card - Full Height with Glass Effect */}
            <div className="lg:col-span-1">
              <BrowseFeedCard />
            </div>
            
            {/* Academic Resources - Masonry Layout */}
            <div className="lg:col-span-3">
              <AcademicResourcesCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Browse Feed Card with Glass Effect
const BrowseFeedCard = () => {
  return (
    <div className="h-96 bg-gradient-to-br from-white/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"></div>
      
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6">
        {/* Browse Icon */}
        <div className="mb-6">
          <Hand className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        </div>
        
        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-6">
          Browse Feed
        </h3>
        
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-8">
          <p>Create post</p>
          <p>Connect with others</p>
          <p>Help others to reach their goal</p>
        </div>

        {/* Create Button */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110">
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

// Same Height Cards
const DepartmentalGroupCard = () => {
  const activities = [
    { type: 'CT', title: 'Data Structures CT-2', date: 'Tomorrow' },
    { type: 'Result', title: 'Algorithm CT-1 Result', status: 'Published' },
    { type: 'Announcement', title: 'Lab Schedule Updated', time: '2 hours ago' },
    { type: 'CT', title: 'Database CT-1', date: 'Next Week' }
  ];

  return (
    <div className="h-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
        Departmental Group
      </h3>
      <div className="space-y-3">
        {activities.slice(0, 4).map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
              activity.type === 'CT' ? 'bg-red-500' :
              activity.type === 'Result' ? 'bg-green-500' : 'bg-blue-500'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {activity.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {activity.date || activity.status || activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WeekScheduleCard = () => {
  const schedule = [
    { day: 'Mon', course: 'Data Structures', time: '10:00 AM' },
    { day: 'Tue', course: 'Algorithm', time: '2:00 PM' },
    { day: 'Wed', course: 'Database', time: '11:00 AM' },
    { day: 'Thu', course: 'Software Eng.', time: '9:00 AM' },
    { day: 'Fri', course: 'Computer Networks', time: '1:00 PM' }
  ];

  return (
    <div className="h-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
        This Week Schedule
      </h3>
      <div className="space-y-3">
        {schedule.slice(0, 4).map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {item.course}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {item.day}
              </p>
            </div>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded flex-shrink-0">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotificationsCard = () => {
  const notifications = [
    { title: 'New assignment posted', subject: 'Data Structures', time: '2h ago', unread: true },
    { title: 'CT schedule updated', subject: 'Algorithm', time: '4h ago', unread: true },
    { title: 'Lab manual uploaded', subject: 'Database', time: '1d ago', unread: false },
    { title: 'Result published', subject: 'Software Eng.', time: '2d ago', unread: false }
  ];

  return (
    <div className="h-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
        Notifications
      </h3>
      <div className="space-y-3">
        {notifications.slice(0, 4).map((notification, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
              notification.unread ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {notification.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {notification.subject} • {notification.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Masonry Layout Academic Resources
const AcademicResourcesCard = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  
  const academicData = {
    'Level 1': {
      'Term 1': [
        'Mathematics I', 'Physics I', 'Chemistry', 'English', 'Programming',
        'Engineering Drawing', 'Basic Electronics', 'Mechanics', 'Statistics'
      ],
      'Term 2': [
        'Mathematics II', 'Physics II', 'Electrical Circuits', 'Digital Logic',
        'Data Structures', 'Computer Organization', 'Linear Algebra', 'Calculus'
      ]
    },
    'Level 2': {
      'Term 1': [
        'Algorithms', 'Database Systems', 'Computer Networks', 'Operating Systems',
        'Software Engineering', 'Web Programming', 'Computer Graphics', 'Discrete Math'
      ],
      'Term 2': [
        'Machine Learning', 'Artificial Intelligence', 'Compiler Design', 'Computer Architecture',
        'Distributed Systems', 'Mobile Computing', 'Cybersecurity', 'Data Mining'
      ]
    },
    'Level 3': {
      'Term 1': [
        'Advanced Algorithms', 'System Analysis', 'Project Management', 'Advanced Database',
        'Network Security', 'Cloud Computing', 'Big Data', 'IoT Systems'
      ],
      'Term 2': [
        'Deep Learning', 'Computer Vision', 'Natural Language Processing', 'Robotics',
        'Quantum Computing', 'Blockchain', 'Advanced AI', 'Research Methodology'
      ]
    },
    'Level 4': {
      'Term 1': [
        'Thesis/Project I', 'Advanced Software Engineering', 'Ethics in Computing',
        'Entrepreneurship', 'Advanced Security', 'High Performance Computing', 'Bioinformatics'
      ],
      'Term 2': [
        'Thesis/Project II', 'Industry Internship', 'Capstone Project',
        'Professional Development', 'Advanced Research', 'Innovation Lab'
      ]
    }
  };

  const levels = Object.keys(academicData);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 min-h-96">
      <div className="p-6">
        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-6">
          Academic Resources
        </h3>
        
        <div className="grid grid-cols-4 gap-6 h-80">
          {/* Levels Column */}
          <div className="col-span-1 space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Levels</h4>
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => {
                  setSelectedLevel(level);
                  setSelectedTerm(null);
                }}
                className={`w-full text-left p-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedLevel === level
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="col-span-3">
            {!selectedLevel ? (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <p>Select a level to view terms and courses</p>
              </div>
            ) : !selectedTerm ? (
              <div className="grid grid-cols-2 gap-4 h-full">
                {Object.keys(academicData[selectedLevel]).map((term) => (
                  <button
                    key={term}
                    onClick={() => setSelectedTerm(term)}
                    className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 flex items-center justify-center"
                  >
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {term}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {selectedLevel} - {selectedTerm}
                  </h4>
                  <button
                    onClick={() => setSelectedTerm(null)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    ← Back to Terms
                  </button>
                </div>
                  <div className="grid grid-cols-2 gap-3">
                  {academicData[selectedLevel][selectedTerm].slice(0, 8).map((course, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {course}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;