export const initialTickets = [
    {
      id: '1',
      subject: 'Login issues',
      priority: 'High',
      status: 'Open',
      createdAt: new Date('2023-05-15T10:30:00Z'),
      customer: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        accountType: 'Premium'
      },
      newRepliesCount: 2,
      messages: [
        {
          id: '1-1',
          sender: 'user',
          text: "I can't log in to my account, getting error 500",
          timestamp: new Date('2023-05-15T10:30:00Z'),
          attachments: []
        },
        {
          id: '1-2',
          sender: 'support',
          text: "We're looking into this issue. Can you try clearing your cache?",
          timestamp: new Date('2023-05-15T11:15:00Z'),
          attachments: []
        },
        {
          id: '1-3',
          sender: 'user',
          text: "Tried that, still not working. Here's a screenshot of the error",
          timestamp: new Date('2023-05-15T12:30:00Z'),
          attachments: ['https://example.com/screenshots/error1.png']
        }
      ]
    },
    // ... other tickets
  ];