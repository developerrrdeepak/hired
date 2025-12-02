# Public Profiles Implementation

## Overview
Implemented public profile discovery and viewing system for candidates, allowing employers to discover and view candidate profiles.

## Implementation

### 1. ✅ Public Profile Discovery (Already Implemented)
**File**: `src/app/(app)/candidates/page.tsx`

**Query**:
```typescript
query(
  collection(firestore, 'users'),
  where('role', '==', 'Candidate'),
  orderBy('updatedAt', 'desc')
)

// Then filter client-side
candidates.filter(user => 
  user.profileVisibility === 'public' || !user.profileVisibility
)
```

**Features**:
- Real-time listener with `onSnapshot`
- Filters by `role === 'Candidate'`
- Filters by `profileVisibility === 'public'`
- Sorting and filtering (skills, experience, location)
- Card and table views
- Search functionality

### 2. ✅ Public Profile View Page
**File**: `src/app/(app)/public-profile/[userId]/page.tsx`

**Route**: `/public-profile/[userId]`

**Features**:
- Displays full candidate profile
- Shows only if `profileVisibility === 'public'`
- Returns 404 for private profiles
- Real-time data with `useDoc` hook
- Connect and Message buttons
- Sections: About, Skills, Experience, Education, Projects
- Contact info and social links
- Resume download button

## Profile Visibility

### User Document Schema
```typescript
{
  id: string;
  displayName: string;
  email: string;
  role: 'Candidate' | 'Owner' | 'Recruiter';
  profileVisibility: 'public' | 'private';  // ✅ Key field
  avatarUrl?: string;
  currentRole?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  yearsOfExperience?: number;
  experience?: Experience[];
  education?: Education[];
  projects?: Project[];
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  resumeURL?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Visibility Rules
```typescript
// Public profiles
profileVisibility === 'public' || !profileVisibility

// Private profiles (not shown)
profileVisibility === 'private'
```

## Public Profile Page Sections

### 1. Header
- Avatar (large)
- Name and current role
- Location and years of experience
- Connect and Message buttons

### 2. About Section
- Full bio/summary
- Profile photo
- Basic info (location, experience)

### 3. Skills Section
- All skills as badges
- Grouped and styled

### 4. Experience Section
- Job title, company
- Start/end dates
- Description
- Icon for each entry

### 5. Education Section
- Degree and field of study
- Institution name
- Years attended

### 6. Projects Section
- Project name
- Description
- Link to project (if available)

### 7. Sidebar
- Contact info (email, phone)
- Social links (LinkedIn, GitHub, Portfolio)
- Resume download button

## Actions on Public Profile

### Connect Button
```typescript
const handleConnect = async () => {
  // Create connection request
  await addDoc(collection(firestore, 'connections'), {
    requesterId: user.uid,
    requesterName: user.displayName,
    requesterRole: 'Recruiter',
    receiverId: profile.id,
    receiverName: profile.displayName,
    receiverRole: 'Candidate',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Send notification
  await updateDoc(doc(firestore, 'users', profile.id), {
    notifications: arrayUnion({
      id: `conn-req-${Date.now()}`,
      type: 'connection_request',
      message: `${user.displayName} sent you a connection request`,
      timestamp: new Date().toISOString(),
      read: false,
    })
  });
};
```

### Message Button
```typescript
const handleMessage = async () => {
  // Create conversation
  const convRef = await addDoc(collection(firestore, 'conversations'), {
    participants: [
      { id: user.uid, name: user.displayName, role: 'Recruiter' },
      { id: profile.id, name: profile.displayName, role: 'Candidate' }
    ],
    participantIds: [user.uid, profile.id],
    lastMessage: '',
    lastMessageAt: new Date().toISOString(),
    unreadCount: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  // Navigate to messages
  router.push(`/messages?convId=${convRef.id}`);
};
```

## Discovery Flow

```
1. Employer visits /candidates
2. Query: users where role='Candidate'
3. Filter: profileVisibility='public'
4. Display: Card/table view with filters
5. Click: "View Profile" button
6. Navigate: /public-profile/[userId]
7. Fetch: User document from Firestore
8. Check: profileVisibility === 'public'
9. Display: Full profile with all sections
10. Actions: Connect, Message, Download Resume
```

## Privacy & Security

### Public Profiles
- ✅ Visible to all employers
- ✅ Searchable and discoverable
- ✅ Full profile information shown
- ✅ Contact info visible
- ✅ Resume downloadable

### Private Profiles
- ❌ Not shown in search results
- ❌ Direct URL returns 404
- ❌ Not discoverable by employers
- ✅ Only visible to candidate themselves

### Default Behavior
```typescript
// If profileVisibility is not set, default to public
profileVisibility === 'public' || !profileVisibility
```

## Firestore Queries

### Discover Public Candidates
```typescript
// Query all candidates
const candidatesQuery = query(
  collection(firestore, 'users'),
  where('role', '==', 'Candidate'),
  orderBy('updatedAt', 'desc')
);

// Subscribe with onSnapshot
onSnapshot(candidatesQuery, (snapshot) => {
  const allUsers = snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  }));
  
  // Filter public profiles
  const publicProfiles = allUsers.filter(user =>
    user.profileVisibility === 'public' || !user.profileVisibility
  );
  
  setProfiles(publicProfiles);
});
```

### Fetch Single Profile
```typescript
const userRef = doc(firestore, 'users', userId);

const { data: profile, isLoading } = useDoc(userRef);

// Check visibility
if (!profile || profile.profileVisibility === 'private') {
  notFound(); // Return 404
}
```

## UI Components

### Profile Card (Candidates List)
```typescript
<Card>
  <CardHeader>
    <Avatar />
    <Name />
    <CurrentRole />
  </CardHeader>
  <CardContent>
    <Email />
    <Location />
    <Experience />
    <Skills />
  </CardContent>
  <CardFooter>
    <ViewProfileButton />
    <ShortlistButton />
    <MessageButton />
    <ConnectButton />
  </CardFooter>
</Card>
```

### Public Profile Page
```typescript
<PageHeader>
  <Name />
  <CurrentRole />
  <ConnectButton />
  <MessageButton />
</PageHeader>

<Grid>
  <MainContent>
    <AboutCard />
    <SkillsCard />
    <ExperienceCard />
    <EducationCard />
    <ProjectsCard />
  </MainContent>
  
  <Sidebar>
    <ContactCard />
    <LinksCard />
    <ResumeCard />
  </Sidebar>
</Grid>
```

## Testing Checklist

- [x] Query users with role='Candidate'
- [x] Filter by profileVisibility='public'
- [x] Real-time updates via onSnapshot
- [x] Public profile page displays correctly
- [x] Private profiles return 404
- [x] Connect button creates connection request
- [x] Message button creates conversation
- [x] Resume download works
- [x] Social links work
- [x] All profile sections display
- [x] Loading states work
- [x] Error handling works
- [x] Navigation from candidates list works

## Files Created/Modified

### Created
1. `src/app/(app)/public-profile/[userId]/page.tsx` - Public profile view page

### Modified
1. `src/app/(app)/candidates/page.tsx` - Added "View Profile" button linking to public profile
2. `src/lib/definitions.ts` - Already has profileVisibility field in User type

## Usage Examples

### Link to Public Profile
```typescript
// From candidates list
<Link href={`/public-profile/${candidate.id}`}>
  View Profile
</Link>

// From anywhere
<Button onClick={() => router.push(`/public-profile/${userId}`)}>
  View Profile
</Button>
```

### Check Profile Visibility
```typescript
// In component
if (!profile || profile.profileVisibility === 'private') {
  notFound();
}

// In query filter
const publicProfiles = allProfiles.filter(p =>
  p.profileVisibility === 'public' || !p.profileVisibility
);
```

### Set Profile Visibility
```typescript
// In profile edit page
await updateDoc(userRef, {
  profileVisibility: 'public', // or 'private'
  updatedAt: new Date().toISOString(),
});
```

## Profile Completeness

### Recommended Fields
- ✅ displayName (required)
- ✅ email (required)
- ✅ currentRole (recommended)
- ✅ location (recommended)
- ✅ bio (recommended)
- ✅ skills (recommended)
- ✅ yearsOfExperience (recommended)
- ✅ avatarUrl (recommended)
- ✅ resumeURL (recommended)

### Optional Fields
- experience[]
- education[]
- projects[]
- linkedIn
- github
- portfolio
- phone

## SEO & Discoverability

### URL Structure
```
/public-profile/[userId]
```

### Meta Tags (Future Enhancement)
```typescript
export const metadata = {
  title: `${profile.displayName} - ${profile.currentRole}`,
  description: profile.bio,
  openGraph: {
    title: profile.displayName,
    description: profile.currentRole,
    images: [profile.avatarUrl],
  },
};
```

## Performance

- ✅ Real-time updates with onSnapshot
- ✅ Memoized queries
- ✅ Lazy loading of profile data
- ✅ Optimized re-renders
- ✅ Skeleton loading states

## Accessibility

- ✅ Semantic HTML
- ✅ Proper heading hierarchy
- ✅ Alt text for images
- ✅ Keyboard navigation
- ✅ Screen reader friendly

## Summary

✅ **Public Profile Discovery**: Query users with role='Candidate' and profileVisibility='public'
✅ **Real-time Listener**: onSnapshot for live updates
✅ **Sorting & Filtering**: Skills, experience, location filters
✅ **Public Profile View**: Full profile page at /public-profile/[userId]
✅ **Privacy Controls**: Private profiles return 404
✅ **Actions**: Connect, Message, Download Resume
✅ **Comprehensive Display**: About, Skills, Experience, Education, Projects

Public profiles are now fully discoverable and viewable!
