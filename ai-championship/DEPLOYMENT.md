# 🚀 Deployment Instructions

## ✅ Real-Time Messaging Setup

### 1️⃣ Deploy Firestore Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### 2️⃣ Environment Variables

Add to Netlify Environment Variables:

```
GOOGLE_GENAI_API_KEY=AIzaSyBPWDm8YDXFeDkAC_Drc2zhUGE4TrsHcts
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3️⃣ Test Messaging

1. Login as Employer
2. Go to Messages page
3. Click on any conversation
4. Type message and click Send
5. Message should appear in real-time

## 🔥 Features Implemented

✅ Real-time messaging with Firestore
✅ Message send/receive
✅ Unread count badges
✅ Last message preview
✅ Voice messages support
✅ File attachments support
✅ Online status indicators
✅ Read receipts
✅ Mock data fallback

## 📊 Collections Structure

```
conversations/
  └── {conversationId}/
      ├── participants: [{id, name, role, avatarUrl}]
      ├── lastMessage: string
      ├── lastMessageAt: timestamp
      ├── unreadCount: {userId: number}
      └── messages/
          └── {messageId}/
              ├── senderId
              ├── receiverId
              ├── content
              ├── type: 'text' | 'voice' | 'attachment'
              ├── isRead: boolean
              └── createdAt: timestamp
```

## 🛠️ Troubleshooting

### Messages not sending?
- Check Firestore rules are deployed
- Verify Firebase config in environment variables
- Check browser console for errors

### Mock data showing instead of real data?
- This is expected when no conversations exist
- Create a conversation by messaging someone
- Real data will replace mock data automatically

## 🎯 Next Steps

1. Deploy Firestore rules: `firebase deploy --only firestore:rules`
2. Add environment variables to Netlify
3. Redeploy on Netlify
4. Test messaging functionality
