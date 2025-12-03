export const mockConversations = [
  {
    id: 'conv1',
    participants: [
      { id: 'user1', name: 'Sarah Johnson', role: 'Recruiter', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SJ' },
      { id: 'current', name: 'You', role: 'Candidate', avatarUrl: '' }
    ],
    lastMessage: 'Thanks for your interest in the position!',
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: { current: 2 },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'conv2',
    participants: [
      { id: 'user2', name: 'Michael Chen', role: 'Hiring Manager', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=MC' },
      { id: 'current', name: 'You', role: 'Candidate', avatarUrl: '' }
    ],
    lastMessage: 'When can we schedule the interview?',
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    unreadCount: { current: 0 },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'conv3',
    participants: [
      { id: 'user3', name: 'Emily Davis', role: 'Tech Lead', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=ED' },
      { id: 'current', name: 'You', role: 'Candidate', avatarUrl: '' }
    ],
    lastMessage: 'I have reviewed your resume and would like to discuss further.',
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    unreadCount: { current: 1 },
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const mockMessages: Record<string, any[]> = {
  conv1: [
    {
      id: 'm1',
      conversationId: 'conv1',
      senderId: 'user1',
      senderName: 'Sarah Johnson',
      senderRole: 'Recruiter',
      receiverId: 'current',
      type: 'text',
      content: 'Hi! I saw your profile and think you would be a great fit for our Senior Developer position.',
      isRead: true,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'm2',
      conversationId: 'conv1',
      senderId: 'current',
      senderName: 'You',
      senderRole: 'Candidate',
      receiverId: 'user1',
      type: 'text',
      content: 'Hello! Thanks for reaching out. I\'d love to learn more about the position.',
      isRead: true,
      createdAt: new Date(Date.now() - 5400000).toISOString()
    },
    {
      id: 'm3',
      conversationId: 'conv1',
      senderId: 'user1',
      senderName: 'Sarah Johnson',
      senderRole: 'Recruiter',
      receiverId: 'current',
      type: 'text',
      content: 'Thanks for your interest in the position!',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  conv2: [
    {
      id: 'm4',
      conversationId: 'conv2',
      senderId: 'user2',
      senderName: 'Michael Chen',
      senderRole: 'Hiring Manager',
      receiverId: 'current',
      type: 'text',
      content: 'When can we schedule the interview?',
      isRead: true,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ],
  conv3: [
    {
      id: 'm5',
      conversationId: 'conv3',
      senderId: 'user3',
      senderName: 'Emily Davis',
      senderRole: 'Tech Lead',
      receiverId: 'current',
      type: 'text',
      content: 'I have reviewed your resume and would like to discuss further.',
      isRead: false,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]
};
