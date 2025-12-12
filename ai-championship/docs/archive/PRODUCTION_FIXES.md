# 🔧 Production Fixes - Priority Order

## ✅ ALREADY WORKING (Don't Touch)
- Firebase Auth with Google Sign-in
- Job creation and listing
- Application submission flow
- Candidate search with filters
- Messages system (creates conversations)
- Connections system (send/accept requests)
- Community feed (posts, likes)
- Profile editing
- AI Hub with tools
- Interview prep
- Voice interview
- Analytics dashboard
- Settings page

---

## 🔥 CRITICAL FIXES NEEDED

### 1. Photo Upload Not Saving ✅ FIXED
**Status**: Already working in profile/edit page
**Code**: Uses Firebase Storage + updates Firestore
**Location**: `src/app/(app)/profile/edit/page.tsx`

### 2. Application Flow ✅ FIXED  
**Status**: Fixed in commit 8b12fdc
**Solution**: Pass organizationId through URL params
**Working**: Candidate can apply → Employer sees in Applications tab

### 3. Community Feed Visibility ✅ WORKING
**Status**: All posts visible, likes working
**Fixed**: Array.isArray checks added for likes
**Location**: `src/app/(app)/community/page.tsx`

---

## 📋 RECOMMENDED IMPROVEMENTS (Non-Breaking)

### 4. Add Comments to Posts
```typescript
// Add to community page
const handleAddComment = async (postId: string, comment: string) => {
  await addDoc(collection(firestore, `posts/${postId}/comments`), {
    userId,
    userName: displayName,
    content: comment,
    createdAt: new Date().toISOString(),
  });
};
```

### 5. Profile Visibility Toggle
```typescript
// Add to user document
profileVisibility: 'public' | 'private'

// Add to profile edit page
<Switch 
  checked={profileVisibility === 'public'}
  onCheckedChange={(checked) => 
    setProfileVisibility(checked ? 'public' : 'private')
  }
/>
```

### 6. Job Status Toggle
```typescript
// Add to job detail page (employer view)
const handleCloseJob = async () => {
  await updateDoc(doc(firestore, `organizations/${orgId}/jobs`, jobId), {
    status: 'closed',
    updatedAt: new Date().toISOString(),
  });
};
```

---

## 🎯 CURRENT FIRESTORE SCHEMA (Working)

```
users/{userId}
  - displayName, email, role, organizationId
  - photoURL, bio, skills, experience
  - profileVisibility (add this)

organizations/{orgId}
  - name, about, websiteUrl
  
organizations/{orgId}/jobs/{jobId}
  - title, description, skills, salary
  - status: 'open' | 'closed'
  - organizationId, createdBy
  
organizations/{orgId}/applications/{appId}
  - jobId, candidateId, candidateName
  - stage, fitScore, coverLetter
  - createdAt, updatedAt

organizations/{orgId}/candidates/{candidateId}
  - (auto-created from users when they apply)

conversations/{convId}
  - participants: [{id, name, role}]
  - participantIds: [uid1, uid2]
  - lastMessage, lastMessageAt
  - unreadCount: {uid: count}

conversations/{convId}/messages/{msgId}
  - senderId, receiverId, content
  - type: 'text' | 'voice' | 'attachment'
  - createdAt, isRead

connections/{connId}
  - requesterId, receiverId
  - requesterName, receiverName
  - status: 'pending' | 'accepted' | 'rejected'
  - createdAt, updatedAt

posts/{postId}
  - authorId, authorName, authorRole
  - type, title, content
  - likes: [uid1, uid2]
  - comments: []
  - createdAt, updatedAt

challenges/{challengeId}
  - organizationId, title, description
  - type, reward, deadline
  - createdAt, updatedAt
```

---

## 🚀 QUICK WINS (Add These)

### A. Add "Close Job" Button
**File**: `src/app/(app)/jobs/[id]/page.tsx`
```typescript
{!isCandidate && job.status === 'open' && (
  <Button onClick={handleCloseJob} variant="outline">
    Close Job
  </Button>
)}
```

### B. Add Comments Section to Posts
**File**: `src/app/(app)/community/page.tsx`
```typescript
<div className="mt-4 border-t pt-4">
  <Input 
    placeholder="Add a comment..."
    onKeyPress={(e) => {
      if (e.key === 'Enter') {
        handleAddComment(post.id, e.currentTarget.value);
        e.currentTarget.value = '';
      }
    }}
  />
</div>
```

### C. Add Profile Visibility Setting
**File**: `src/app/(app)/profile/edit/page.tsx`
```typescript
<div className="flex items-center justify-between">
  <Label>Public Profile</Label>
  <Switch 
    checked={profileVisibility === 'public'}
    onCheckedChange={handleVisibilityChange}
  />
</div>
```

### D. Show Applicants Count on Job Card
**File**: `src/app/(app)/jobs/page.tsx`
```typescript
// Add to JobCard component
<Badge variant="secondary">
  {applicationsCount} applicants
</Badge>
```

---

## ⚠️ WHAT NOT TO DO

❌ Don't rewrite entire Firestore schema
❌ Don't change existing working routes
❌ Don't remove mock data that's being used as fallback
❌ Don't break existing Firebase queries
❌ Don't change authentication flow
❌ Don't modify working components

---

## ✅ TESTING CHECKLIST

### Employer Flow:
1. ✅ Create job
2. ✅ See applications
3. ✅ Accept/Reject candidates
4. ✅ Message candidates
5. ✅ Connect with candidates
6. ✅ Post in community
7. ✅ View analytics

### Candidate Flow:
1. ✅ Browse jobs
2. ✅ Apply to job
3. ✅ See application status
4. ✅ Edit profile
5. ✅ Upload photo/resume
6. ✅ Message employers
7. ✅ Connect with employers
8. ✅ Post in community
9. ✅ Use AI tools

---

## 🎯 PRIORITY FIXES (Do These First)

1. **Add Comments to Posts** (30 min)
2. **Add Profile Visibility Toggle** (20 min)
3. **Add Close Job Button** (15 min)
4. **Show Applicant Count** (15 min)
5. **Add Typing Indicator to Messages** (30 min)

Total: ~2 hours of work

---

## 📝 DEPLOYMENT NOTES

**Current Status**: App is 90% functional
**Remaining**: Minor UX improvements
**Risk**: Low - existing features working
**Recommendation**: Ship current version, iterate based on user feedback

---

## 🔐 FIREBASE RULES (Current - Working)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /organizations/{orgId}/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /conversations/{convId}/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /connections/{connId} {
      allow read, write: if request.auth != null;
    }
    
    match /posts/{postId}/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /challenges/{challengeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

**Recommendation**: Focus on polish and UX improvements rather than complete rewrite. Current architecture is solid and working.
