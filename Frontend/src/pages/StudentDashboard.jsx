import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  FileText, 
  Download, 
  MessageCircle, 
  Plus,
  Edit3,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Users,
  X
} from 'lucide-react';

// Mock data for weekly schedule and tasks
const mockWeeklyTasks = [
  {
    id: 1,
    title: 'Data Structures CT-2',
    type: 'exam',
    date: '2025-01-03',
    time: '10:00 AM',
    priority: 'high',
    completed: false
  },
  {
    id: 2,
    title: 'Algorithm Assignment Submission',
    type: 'assignment',
    date: '2025-01-02',
    time: '11:59 PM',
    priority: 'high',
    completed: false
  },
  {
    id: 3,
    title: 'Database Lab Report',
    type: 'lab',
    date: '2025-01-04',
    time: '2:00 PM',
    priority: 'medium',
    completed: true
  },
  {
    id: 4,
    title: 'Software Engineering Presentation',
    type: 'presentation',
    date: '2025-01-05',
    time: '9:00 AM',
    priority: 'medium',
    completed: false
  },
  {
    id: 5,
    title: 'Computer Networks Quiz',
    type: 'quiz',
    date: '2025-01-06',
    time: '3:00 PM',
    priority: 'low',
    completed: false
  }
];

// Mock class routine image
const mockClassRoutine = {
  hasCustom: false,
  defaultImage: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=800',
  customImage: null
};

// Mini Profile Component
const MiniProfile = ({ user }) => {
  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
          <span className="text-white font-bold text-xl">
            {getInitials(user?.fullName)}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{user?.fullName || 'Student Name'}</h2>
          <p className="text-blue-100 text-sm">ID: {user?.studentId || 'XXXXXXX'}</p>
          <p className="text-blue-200 text-sm">{user?.department || 'Department'} - Batch {user?.batch || 'XX'}</p>
        </div>
        <div className="text-right">
          <div className="w-3 h-3 bg-green-400 rounded-full mb-1 animate-pulse"></div>
          <span className="text-xs text-blue-200">Online</span>
        </div>
      </div>
    </div>
  );
};

// Activity Stats Component
const ActivityStats = () => {
  const stats = [
    {
      icon: FileText,
      value: '12',
      label: 'Posts Created',
      color: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: MessageCircle,
      value: '48',
      label: 'Comments Made',
      color: 'text-green-500 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: Download,
      value: '7',
      label: 'Resources Downloaded',
      color: 'text-orange-500 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Stats</h3>
      <div className="space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Weekly Schedule Component
const WeeklySchedule = () => {
  const [tasks, setTasks] = useState(mockWeeklyTasks);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const addTaskInputRef = useRef(null);

  useEffect(() => {
    if (isAddingTask) {
      addTaskInputRef.current?.focus();
    }
  }, [isAddingTask]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'exam': return <BookOpen className="h-4 w-4" />;
      case 'assignment': return <FileText className="h-4 w-4" />;
      case 'lab': return <AlertCircle className="h-4 w-4" />;
      case 'presentation': return <Users className="h-4 w-4" />;
      case 'quiz': return <Check className="h-4 w-4" />;
      case 'user': return <Plus className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleAddNewTask = () => {
    if (newTaskTitle.trim() === "") return;

    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      type: 'user',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      priority: 'low',
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">This Week's Important Tasks</h3>
        <button 
          onClick={() => setIsAddingTask(!isAddingTask)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={`p-4 rounded-lg border transition-all ${
              task.completed 
                ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-60' 
                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleTaskCompletion(task.id)}
                className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                  task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 dark:border-gray-500 hover:border-green-500'
                }`}
              >
                {task.completed && <Check className="h-3 w-3" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {task.title}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    {getTypeIcon(task.type)}
                    <span className="capitalize">{task.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(task.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>{task.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {isAddingTask && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
          <input
            ref={addTaskInputRef}
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNewTask()}
            placeholder="Enter new task title..."
            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
          />
          <div className="flex justify-end items-center gap-2 mt-2">
            <button 
              onClick={() => setIsAddingTask(false)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <button 
              onClick={handleAddNewTask}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={!newTaskTitle.trim()}
            >
              Add Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Class Routine Component
const ClassRoutine = () => {
  const [routine, setRoutine] = useState(mockClassRoutine);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setRoutine({
          ...routine,
          hasCustom: true,
          customImage: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetToDefault = () => {
    setRoutine({
      ...routine,
      hasCustom: false,
      customImage: null
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Class Routine</h3>
        <div className="flex gap-2">
          <label className="cursor-pointer p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Upload className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          {routine.hasCustom && (
            <button
              onClick={resetToDefault}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Reset to default"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="relative group">
        <img
          src={routine.hasCustom ? routine.customImage : routine.defaultImage}
          alt="Class Routine"
          className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
        />
        
        {!routine.hasCustom && (
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-center text-white">
              <ImageIcon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Upload your custom routine</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          {routine.hasCustom ? 'Custom routine' : 'Default routine'}
        </span>
        <button className="text-blue-600 dark:text-blue-400 hover:underline">
          View Full Size
        </button>
      </div>
    </div>
  );
};

// Recent Activity Component
const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'post',
      title: 'Created a new post about Data Structures',
      time: '2 hours ago',
      icon: FileText
    },
    {
      id: 2,
      type: 'download',
      title: 'Downloaded Physics I notes',
      time: '1 day ago',
      icon: Download
    },
    {
      id: 3,
      type: 'comment',
      title: 'Commented on Algorithm discussion',
      time: '2 days ago',
      icon: MessageCircle
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
      
      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">{activity.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <button className="w-full mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
        View All Activity
      </button>
    </div>
  );
};

const StudentDashboard = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your academic journey today.
          </p>
        </div>

        {/* Top Row - Mini Profile */}
        <MiniProfile user={user} />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Schedule */}
            <WeeklySchedule />
            
            {/* Class Routine */}
            <ClassRoutine />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Activity Stats */}
            <ActivityStats />

            {/* Recent Activity */}
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
