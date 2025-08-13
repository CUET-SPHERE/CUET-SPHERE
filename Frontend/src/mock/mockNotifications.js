export const mockNotifications = [
   {
      id: 1,
      type: 'post_like',
      content: 'John Doe liked your post',
      relatedPostTitle: 'Introduction to Data Structures',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      read: false
   },
   {
      id: 2,
      type: 'comment',
      content: 'Sarah Smith commented on your post',
      relatedPostTitle: 'Tips for Programming Contest',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      read: false
   },
   {
      id: 3,
      type: 'mention',
      content: 'Alice mentioned you in a comment',
      relatedPostTitle: 'Computer Networks Assignment Help',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: true
   },
   {
      id: 4,
      type: 'resource_share',
      content: 'New study material shared in CSE Resources',
      relatedResourceName: 'Data Structures Notes',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      read: true
   },
   {
      id: 5,
      type: 'group_invite',
      content: 'You were invited to join CSE Study Group',
      groupName: 'CSE Study Group',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      read: true
   }
];
