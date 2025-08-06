export const mockPosts = [
  {
    id: 1,
    author: 'Muhammad Rony',
    authorEmail: 'rony@student.cuet.ac.bd',
    studentId: '2204005',
    profilePicture: null,
    timestamp: '2024-12-29T08:30:00Z',
    title: 'How to prepare for Data Structures CT?',
    content: 'Can anyone share tips or resources for the upcoming CT? I am a bit nervous about the implementation questions.',
    category: 'Help',
    upvotes: 5,
    downvotes: 0,
    commentsCount: 2,
    bookmarked: false,
    attachment: null,
    image: null,
    comments: [
      {
        id: 1,
        author: 'Fatima Khan',
        authorEmail: 'fatima@student.cuet.ac.bd',
        studentId: '2204012',
        profilePicture: null,
        content: 'Practice previous year questions and focus on tree traversals. Good luck!',
        timestamp: '2024-12-29T09:15:00Z',
        isEdited: false,
        replies: [
          {
            id: 11,
            author: 'Muhammad Rony',
            authorEmail: 'rony@student.cuet.ac.bd',
            studentId: '2204005',
            profilePicture: null,
            content: 'Thanks! Do you have any specific resources for tree problems?',
            timestamp: '2024-12-29T09:30:00Z',
            isEdited: false,
            replies: [
              {
                id: 111,
                author: 'Fatima Khan',
                authorEmail: 'fatima@student.cuet.ac.bd',
                studentId: '2204012',
                profilePicture: null,
                content: 'Yes! Check out the CUET library database, they have great books on algorithms.',
                timestamp: '2024-12-29T09:45:00Z',
                isEdited: false,
                replies: []
              }
            ]
          }
        ]
      },
      {
        id: 2,
        author: 'Ahmed Hassan',
        authorEmail: 'ahmed@student.cuet.ac.bd',
        studentId: '2204023',
        profilePicture: null,
        content: 'I recommend the GeeksforGeeks practice problems for DS. Very helpful!',
        timestamp: '2024-12-29T10:00:00Z',
        isEdited: false,
        replies: []
      }
    ]
  },
  {
    id: 2,
    author: 'Ayesha Rahman',
    authorEmail: 'ayesha@student.cuet.ac.bd',
    studentId: '2204018',
    profilePicture: null,
    timestamp: '2024-12-29T06:45:00Z',
    title: 'Previous Year Questions Uploaded',
    content: 'I have uploaded the previous year questions for Physics I. Check the Academic Resources section.',
    category: 'Resource',
    upvotes: 8,
    downvotes: 1,
    commentsCount: 3,
    bookmarked: true,
    attachment: 'physics1_questions.pdf',
    image: 'https://via.placeholder.com/600x400/3b82f6/ffffff?text=Physics+Questions',
    comments: [
      {
        id: 3,
        author: 'Nasir Ahmed',
        authorEmail: 'nasir@student.cuet.ac.bd',
        studentId: '2204031',
        profilePicture: null,
        content: 'Thank you so much! This is exactly what I needed.',
        timestamp: '2024-12-29T07:20:00Z',
        isEdited: false,
        replies: []
      },
      {
        id: 4,
        author: 'Samira Khatun',
        authorEmail: 'samira@student.cuet.ac.bd',
        studentId: '2204045',
        profilePicture: null,
        content: 'Could you also upload the solution keys if you have them?',
        timestamp: '2024-12-29T08:00:00Z',
        isEdited: false,
        replies: []
      },
      {
        id: 5,
        author: 'Ayesha Rahman',
        authorEmail: 'ayesha@student.cuet.ac.bd',
        studentId: '2204018',
        profilePicture: null,
        content: 'I will upload the solutions soon. Stay tuned!',
        timestamp: '2024-12-29T08:30:00Z',
        isEdited: false,
        replies: []
      }
    ]
  },
  {
    id: 3,
    author: 'CR CSE 22',
    authorEmail: 'cr.cse22@student.cuet.ac.bd',
    studentId: '2204001',
    profilePicture: null,
    timestamp: '2024-12-28T21:15:00Z',
    title: 'CT-2 Date Announced',
    content: 'CT-2 for Data Structures will be held on 10th January. Best of luck to everyone! Please prepare well and be on time.',
    category: 'Announcement',
    upvotes: 12,
    downvotes: 0,
    commentsCount: 1,
    bookmarked: false,
    attachment: null,
    image: null,
    comments: [
      {
        id: 6,
        author: 'Rahul Das',
        authorEmail: 'rahul@student.cuet.ac.bd',
        studentId: '2204055',
        profilePicture: null,
        content: 'Thanks for the update! What time will the exam start?',
        timestamp: '2024-12-28T22:00:00Z',
        isEdited: false,
        replies: []
      }
    ]
  },
  {
    id: 4,
    author: 'Tanvir Hasan',
    authorEmail: 'tanvir@student.cuet.ac.bd',
    studentId: '2204067',
    profilePicture: null,
    timestamp: '2024-12-28T15:30:00Z',
    title: 'Group Study Session This Weekend',
    content: 'Planning a group study session for Algorithm Analysis this Saturday at the library. Anyone interested?',
    category: 'Question',
    upvotes: 6,
    downvotes: 0,
    commentsCount: 4,
    bookmarked: true,
    attachment: null,
    image: 'https://via.placeholder.com/600x300/10b981/ffffff?text=Study+Group',
    comments: [
      {
        id: 7,
        author: 'Nusrat Jahan',
        authorEmail: 'nusrat@student.cuet.ac.bd',
        studentId: '2204034',
        profilePicture: null,
        content: 'Count me in! What time are you planning?',
        timestamp: '2024-12-28T16:00:00Z',
        isEdited: false,
        replies: []
      },
      {
        id: 8,
        author: 'Karim Rahman',
        authorEmail: 'karim@student.cuet.ac.bd',
        studentId: '2204028',
        profilePicture: null,
        content: 'I would like to join too. Which topics will we cover?',
        timestamp: '2024-12-28T16:30:00Z',
        isEdited: false,
        replies: [
          {
            id: 81,
            author: 'Tanvir Hasan',
            authorEmail: 'tanvir@student.cuet.ac.bd',
            studentId: '2204067',
            profilePicture: null,
            content: 'We will cover sorting algorithms, time complexity, and maybe some graph basics.',
            timestamp: '2024-12-28T16:45:00Z',
            isEdited: false,
            replies: []
          }
        ]
      },
      {
        id: 9,
        author: 'Tanvir Hasan',
        authorEmail: 'tanvir@student.cuet.ac.bd',
        studentId: '2204067',
        profilePicture: null,
        content: 'Great! Let us meet at 2 PM. We will focus on sorting algorithms and complexity analysis.',
        timestamp: '2024-12-28T17:00:00Z',
        isEdited: true,
        replies: []
      },
      {
        id: 10,
        author: 'Priya Sharma',
        authorEmail: 'priya@student.cuet.ac.bd',
        studentId: '2204041',
        profilePicture: null,
        content: 'Sounds perfect! See you all there.',
        timestamp: '2024-12-28T18:00:00Z',
        isEdited: false,
        replies: []
      }
    ]
  }
]; 