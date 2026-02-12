# Firestore Security Rules Setup

## Quick Fix for Permission Error

You're getting "Missing or insufficient permissions" because Firestore Security Rules need to be updated.

## Option 1: Firebase Console (Fastest)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Firestore Database** in left menu
4. Click **Rules** tab
5. Replace all rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow authenticated users to read all users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // Organizations and subcollections
    match /organizations/{orgId} {
      allow read, write: if request.auth != null;
      
      match /{document=**} {
        allow read, write: if request.auth != null;
      }
    }
    
    // Posts - anyone authenticated can read, only author can update/delete
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
    
    // Connections
    match /connections/{connectionId} {
      allow read, write: if request.auth != null;
    }
    
    // Conversations and messages
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

6. Click **Publish**

## Option 2: Firebase CLI

```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## Option 3: Test Mode (Development Only)

⚠️ **WARNING: Only use for development/testing**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This allows all authenticated users to read/write everything.

## Verify Rules Are Applied

1. Go to Firebase Console → Firestore Database → Rules
2. Check the "Last deployed" timestamp
3. Refresh your app and test

## Common Issues

### Still getting permission errors?
- Clear browser cache and reload
- Check you're logged in (check console for auth.uid)
- Wait 1-2 minutes for rules to propagate

### Rules not deploying?
- Make sure you're in the correct Firebase project
- Check Firebase CLI is logged in: `firebase login`
- Verify project ID: `firebase projects:list`

## Production Rules (Recommended)

For production, use more restrictive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /organizations/{orgId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationId == orgId;
      
      match /{subcollection}/{docId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && 
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationId == orgId;
      }
    }
    
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
    }
  }
}
```

## Need Help?

If you're still having issues:
1. Check Firebase Console → Firestore → Rules tab
2. Look at the "Simulator" to test rules
3. Check browser console for detailed error messages
