# 🔧 Google Sign-In Error Fix

## Error in Console:
```
Google Sign-In failed: FirebaseError: Error (auth/internal-error)
```

## Root Cause:
Firebase Console me authorized domains missing hai.

## Fix Steps:

### 1. Go to Firebase Console
https://console.firebase.google.com/project/studio-1555095820-f32c6

### 2. Enable Google Sign-In
1. Go to **Authentication** → **Sign-in method**
2. Click **Google** provider
3. Click **Enable**
4. Add support email
5. Save

### 3. Add Authorized Domains
1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add these domains:
   - `localhost` (already added)
   - `hirevision.netlify.app`
   - Your custom domain if any

### 4. Check OAuth Consent Screen
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Select project: `studio-1555095820-f32c6`
3. Go to **APIs & Services** → **OAuth consent screen**
4. Add authorized domains:
   - `hirevision.netlify.app`
   - `netlify.app`

### 5. Verify Redirect URIs
In Firebase Console → Authentication → Settings:
- `http://localhost:9002` ✅
- `https://hirevision.netlify.app` ✅

---

## Alternative: Use Email/Password Sign-In

If Google Sign-In still not working, enable Email/Password:

### Firebase Console:
1. Authentication → Sign-in method
2. Enable **Email/Password**
3. Save

### Update Sign-In Page:
Add email/password form as fallback.

---

## DialogContent Warning Fix

The accessibility warning is just a warning, not breaking. To fix:

### Find all Dialog components and add DialogTitle:

```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title Here</DialogTitle>  {/* Add this */}
    </DialogHeader>
    {/* rest of content */}
  </DialogContent>
</Dialog>
```

---

## Quick Test:

1. Clear browser cache
2. Try sign in again
3. Check console for new errors
4. If still failing, check Firebase Console → Authentication → Users to see if any users exist

---

## Environment Variables Check:

Verify `.env.local` has:
```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-1555095820-f32c6
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAmUbAHWhTTJkW3hdmzUeZztv543A0spwI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-1555095820-f32c6.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-1555095820-f32c6.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=817114304956
NEXT_PUBLIC_FIREBASE_APP_ID=1:817114304956:web:916bc1d8d4bb0df1551bb9
```

Restart dev server after changing env vars:
```bash
npm run dev
```

---

## Status:
- ✅ Firebase config correct
- ⚠️ Need to enable Google Sign-In in Firebase Console
- ⚠️ Need to add authorized domains
- ✅ Code is working, just configuration issue
