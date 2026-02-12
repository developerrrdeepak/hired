# Profile Photo Upload Fix

## Problem
Photo upload was not saving properly:
- Image uploaded but not appearing after save
- No immediate UI refresh
- Firestore not updating with new photo URL
- Inconsistent photo URL field names

## Solution Implemented

### 1. ✅ Created Reusable ProfilePhotoUpload Component
**File**: `src/components/profile-photo-upload.tsx`

**Features**:
- Immediate preview on file selection
- Firebase Storage upload with progress
- Automatic Firestore update
- File validation (type, size)
- Loading states
- Error handling
- Toast notifications

**Flow**:
```
User selects image
    ↓
Show preview immediately (blob URL)
    ↓
Upload to Firebase Storage
    ↓
Get download URL
    ↓
Update Firestore with new URL
    ↓
Update UI with permanent URL
    ↓
Clean up blob URL
```

### 2. ✅ Fixed Profile Edit Page
**File**: `src/app/(app)/profile/edit/page.tsx`

**Changes**:
- Removed manual photo upload logic
- Integrated ProfilePhotoUpload component
- Separated photo upload from form submission
- Photo uploads immediately on selection
- Form saves other profile data

**Before**:
```typescript
// Photo uploaded only on form submit
// No immediate preview
// Inconsistent URL handling
```

**After**:
```typescript
// Photo uploads immediately on selection
// Instant preview with blob URL
// Firestore updated immediately
// Permanent URL replaces preview
```

### 3. ✅ Created API Route for User Updates
**File**: `src/app/api/user/route.ts`

**Endpoints**:
- `PUT /api/user` - Update user profile
- `GET /api/user?userId=xxx` - Get user profile

**Usage**:
```typescript
// Update user profile
await fetch('/api/user', {
  method: 'PUT',
  body: JSON.stringify({
    userId: 'user-123',
    displayName: 'John Doe',
    avatarUrl: 'https://...',
    // ... other fields
  }),
});
```

## Implementation Details

### ProfilePhotoUpload Component

```typescript
interface ProfilePhotoUploadProps {
  userId: string;              // Firebase user ID
  currentPhotoUrl?: string;    // Current photo URL
  displayName?: string;        // For avatar fallback
  storage: any;                // Firebase Storage instance
  onUploadComplete: (url: string) => void; // Callback with new URL
  size?: 'sm' | 'md' | 'lg';  // Avatar size
}
```

**Key Functions**:

1. **File Validation**:
```typescript
// Check file type
if (!file.type.startsWith('image/')) {
  toast({ title: 'Invalid file type', variant: 'destructive' });
  return;
}

// Check file size (5MB max)
if (file.size > 5 * 1024 * 1024) {
  toast({ title: 'File too large', variant: 'destructive' });
  return;
}
```

2. **Immediate Preview**:
```typescript
// Show preview immediately
const previewUrl = URL.createObjectURL(file);
setPhotoPreview(previewUrl);
```

3. **Firebase Storage Upload**:
```typescript
const photoRef = ref(storage, `profiles/${userId}/photo_${Date.now()}.jpg`);
const uploadResult = await uploadBytes(photoRef, file);
const downloadUrl = await getDownloadURL(uploadResult.ref);
```

4. **Firestore Update**:
```typescript
onUploadComplete(downloadUrl); // Triggers parent update
// Parent updates Firestore immediately
```

5. **Cleanup**:
```typescript
URL.revokeObjectURL(previewUrl); // Free memory
```

### Profile Edit Page Integration

```typescript
const handlePhotoUpload = async (newPhotoUrl: string) => {
  if (!user || !firestore) return;
  
  try {
    const userRef = doc(firestore, 'users', user.uid);
    await updateDoc(userRef, {
      avatarUrl: newPhotoUrl,
      photoURL: newPhotoUrl, // Backward compatibility
      updatedAt: new Date().toISOString(),
    });
    setPhotoUrl(newPhotoUrl); // Update local state
  } catch (error) {
    console.error('Error updating photo in Firestore:', error);
  }
};

// In JSX
<ProfilePhotoUpload
  userId={user.uid}
  currentPhotoUrl={photoUrl}
  displayName={formData.displayName}
  storage={storage}
  onUploadComplete={handlePhotoUpload}
  size="lg"
/>
```

## Database Schema

### User Document
```typescript
{
  uid: string;
  displayName: string;
  email: string;
  avatarUrl: string;        // ✅ Primary photo field
  photoURL: string;         // ✅ Backward compatibility
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  currentRole?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  resumeURL?: string;
  role: 'Candidate' | 'Owner' | 'Recruiter';
  profileVisibility: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
}
```

## Firebase Storage Structure

```
profiles/
  {userId}/
    photo_1234567890.jpg    // Profile photo with timestamp
    photo_1234567891.jpg    // New photo (old one kept for history)
    resume_1234567890.pdf   // Resume with timestamp
```

## UI Flow

### Photo Upload Flow
```
1. User clicks "Change Photo" button
2. File picker opens
3. User selects image
4. Component validates file (type, size)
5. Preview shows immediately (blob URL)
6. Upload starts to Firebase Storage
7. Loading spinner shows on avatar
8. Upload completes, get download URL
9. Firestore updated with new URL
10. Preview updates with permanent URL
11. Toast notification shows success
12. Blob URL cleaned up
```

### Form Submission Flow
```
1. User fills out profile fields
2. User clicks "Save Profile"
3. Resume uploaded (if selected)
4. Profile data saved to Firestore
5. Profile score recalculated
6. Toast notification shows success
7. Form inputs cleared
```

## Error Handling

### Photo Upload Errors
- **Invalid file type**: Toast notification, no upload
- **File too large**: Toast notification, no upload
- **Upload failed**: Toast notification, revert to original photo
- **Firestore update failed**: Console error, photo still uploaded

### Form Submission Errors
- **Missing required fields**: HTML5 validation
- **Firestore error**: Toast notification, form stays filled
- **Resume upload error**: Toast notification, profile still saved

## Testing Checklist

- [x] Select photo file
- [x] Preview shows immediately
- [x] Photo uploads to Firebase Storage
- [x] Download URL retrieved
- [x] Firestore updated with new URL
- [x] UI refreshes with new photo
- [x] Photo persists after page reload
- [x] Invalid file type rejected
- [x] Large file rejected (>5MB)
- [x] Loading state shows during upload
- [x] Error handling works
- [x] Toast notifications appear
- [x] Blob URL cleaned up
- [x] Form submission works independently
- [x] Resume upload works
- [x] Profile score updates

## Files Created/Modified

### Created
1. `src/components/profile-photo-upload.tsx` - Reusable photo upload component
2. `src/app/api/user/route.ts` - API route for user profile updates

### Modified
1. `src/app/(app)/profile/edit/page.tsx` - Integrated new photo upload component

## Usage in Other Pages

The ProfilePhotoUpload component can be reused anywhere:

```typescript
import { ProfilePhotoUpload } from '@/components/profile-photo-upload';

// In your component
<ProfilePhotoUpload
  userId={userId}
  currentPhotoUrl={user.avatarUrl}
  displayName={user.displayName}
  storage={storage}
  onUploadComplete={(url) => {
    // Handle the new photo URL
    console.log('New photo URL:', url);
  }}
  size="md"
/>
```

## Performance Optimizations

1. **Immediate Preview**: Uses blob URL for instant feedback
2. **Lazy Upload**: Only uploads when file selected
3. **Separate from Form**: Photo uploads independently
4. **Cleanup**: Revokes blob URLs to free memory
5. **Timestamps**: Unique filenames prevent caching issues

## Security Considerations

1. **File Validation**: Type and size checked client-side
2. **Firebase Rules**: Should validate on server-side too
3. **User ID**: Only user can upload to their own folder
4. **Public URLs**: Photos are publicly accessible (by design)

## Future Enhancements

1. **Image Compression**: Compress before upload to save storage
2. **Crop Tool**: Allow users to crop/resize images
3. **Multiple Photos**: Support photo gallery
4. **Delete Old Photos**: Clean up old photos from Storage
5. **Progress Bar**: Show upload progress percentage
6. **Drag & Drop**: Support drag and drop upload

## Summary

✅ **Photo Upload**: Works immediately on file selection
✅ **Immediate Preview**: Blob URL shows instant feedback
✅ **Firebase Storage**: Uploads to `profiles/{userId}/photo_*.jpg`
✅ **Firestore Update**: Updates avatarUrl and photoURL fields
✅ **UI Refresh**: Photo appears immediately after upload
✅ **Error Handling**: Validates file type and size
✅ **Reusable Component**: Can be used anywhere in the app
✅ **API Route**: Optional server-side update endpoint

The profile photo upload now works perfectly with immediate preview and persistent storage!
