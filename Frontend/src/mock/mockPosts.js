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
    tags: ['help', 'data-structures', 'exam-prep'],
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
    tags: ['resource', 'physics', 'questions'],
    upvotes: 8,
    downvotes: 1,
    commentsCount: 3,
    bookmarked: true,
    attachment: 'physics1_questions.pdf',
    image: 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
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
    tags: ['announcement', 'data-structures', 'exam'],
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
    tags: ['question', 'study-group', 'algorithms'],
    upvotes: 6,
    downvotes: 0,
    commentsCount: 4,
    bookmarked: true,
    attachment: null,
    image: 'https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
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
      }
    ]
  }
];
