export const mockGroup = {
  departmentName: 'Computer Science & Engineering',
  departmentCode: 'CSE',
  batch: '22',
  memberCount: 45,
  activeThisWeek: 38,
  resourcesShared: 0,
  totalAnnouncements: 0,
  classRepresentatives: [
    {
      id: 1,
      name: 'Sarah Ahmed',
      role: 'Primary CR',
      initials: 'SA',
      avatar: null
    },
    {
      id: 2,
      name: 'Mohammad Rahman',
      role: 'Assistant CR',
      initials: 'MR',
      avatar: null
    }
  ],
  announcements: [
    {
      id: 1,
      message: "Important: Mid-term exam schedule has been updated. Please check the academic calendar for new dates.",
      author: "Sarah Ahmed",
      role: "Primary CR",
      date: "2024-01-15",
      time: "10:30 AM"
    },
    {
      id: 2,
      message: "Reminder: Assignment submission deadline for Data Structures is tomorrow at 11:59 PM.",
      author: "Mohammad Rahman",
      role: "Assistant CR",
      date: "2024-01-14",
      time: "2:15 PM"
    },
    {
      id: 3,
      message: "Lab session for Computer Networks has been rescheduled to Friday 2:00 PM in Lab-3.",
      author: "Sarah Ahmed",
      role: "Primary CR",
      date: "2024-01-13",
      time: "9:45 AM"
    },
    {
      id: 4,
      message: "Study group meeting for Algorithm Analysis will be held tomorrow at 4:00 PM in Room 301.",
      author: "Mohammad Rahman",
      role: "Assistant CR",
      date: "2024-01-12",
      time: "6:20 PM"
    },
    {
      id: 5,
      message: "Please bring your ID cards for the upcoming semester registration process.",
      author: "Sarah Ahmed",
      role: "Primary CR",
      date: "2024-01-11",
      time: "11:00 AM"
    }
  ],
  classTests: [
    {
      id: 1,
      subject: "Data Structures",
      date: "2024-01-20",
      time: "10:00 AM",
      syllabus: "Arrays, Linked Lists, Stacks, Queues",
      room: "Room 205",
      duration: "2 hours"
    },
    {
      id: 2,
      subject: "Computer Networks",
      date: "2024-01-25",
      time: "2:00 PM",
      syllabus: "OSI Model, TCP/IP, Network Protocols",
      room: "Room 301",
      duration: "1.5 hours"
    },
    {
      id: 3,
      subject: "Algorithm Analysis",
      date: "2024-01-28",
      time: "9:00 AM",
      syllabus: "Sorting Algorithms, Time Complexity, Big O Notation",
      room: "Room 102",
      duration: "2 hours"
    }
  ]
};