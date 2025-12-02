# Candidates Tab Fixes - Employer View

## Issues Fixed

### ✅ Show All Public Candidate Profiles
**Problem**: Candidates page only showed candidates from organization's collection, not all public profiles.

**Solution**:
- Changed query from `organizations/{orgId}/candidates` to `users` collection
- Filter by `role === 'Candidate'`
- Filter by `profileVisibility === 'public'` (or undefined for backward compatibility)
- Real-time updates via `useCollection` hook with `onSnapshot`

**Before**:
```typescript
query(collection(firestore, `organizations/${organizationId}/candidates`))
```

**After**:
```typescript
query(
  collection(firestore, 'users'),
  where('role', '==', 'Candidate'),
  orderBy('updatedAt', 'desc')
)
// Then filter: user.profileVisibility === 'public'
```

### ✅ Real-time Listener
**Problem**: Need real-time updates when candidate profiles change.

**Solution**:
- Already using `useCollection` hook which wraps `onSnapshot`
- Automatic re-renders when Firestore data changes
- No polling or manual refresh needed

**Implementation**:
```typescript
const { data: allUsers, isLoading } = useCollection<any>(candidatesQuery);
// useCollection internally uses onSnapshot for real-time updates
```

### ✅ Sorting + Filtering
**Problem**: Need comprehensive sorting and filtering options.

**Solution**: Already implemented with multiple filters:

**Filters Available**:
1. **Search**: Name, email, current role (text search)
2. **Skills**: Dropdown with all available skills
3. **Experience**: 0-2, 3-5, 6-10, 10+ years
4. **Location**: Dropdown with all locations
5. **Shortlisted**: Checkbox to show only shortlisted candidates

**Sorting**:
- Default: By `updatedAt` (most recent first)
- Can be extended to sort by fit score, name, etc.

**Clear Filters**: Button to reset all filters at once

## Features Implemented

### Public Profile Visibility
- **Field**: `profileVisibility: 'public' | 'private'`
- **Default**: Public (for backward compatibility)
- **Logic**: Only show candidates with `profileVisibility === 'public'`

### Real-time Updates
- **Hook**: `useCollection` with `onSnapshot`
- **Updates**: Automatic when:
  - New candidate registers
  - Candidate updates profile
  - Candidate changes visibility
  - Shortlist status changes

### Advanced Filtering
```typescript
const filteredCandidates = useMemo(() => {
  return candidatesWithInfo.filter(candidate => {
    const matchesSearch = searchTerm ? /* name/email/role match */ : true;
    const matchesSkill = skillFilter ? /* has skill */ : true;
    const matchesExperience = experienceFilter !== 'all' ? /* in range */ : true;
    const matchesLocation = locationFilter !== 'all' ? /* location match */ : true;
    const matchesShortlist = showShortlisted ? candidate.isShortlisted : true;
    
    return matchesSearch && matchesSkill && matchesExperience && 
           matchesLocation && matchesShortlist;
  });
}, [candidatesWithInfo, searchTerm, skillFilter, experienceFilter, 
    locationFilter, showShortlisted]);
```

### Top 10 AI Matches
- Shows candidates with highest fit scores
- Sorted by `fitScore` descending
- Real-time updates as applications come in
- Quick access to top talent

### Card & Table Views
- **Card View**: Visual cards with avatars, skills, actions
- **Table View**: Compact table with sortable columns
- Toggle button to switch between views

### Quick Actions
1. **Shortlist**: Bookmark icon to save candidates
2. **Message**: Mail icon to start conversation
3. **Connect**: UserPlus icon to send connection request
4. **View Profile**: Click name/avatar to see full profile

## Database Schema

### User Document (Candidate)
```typescript
{
  id: string;
  displayName: string;
  email: string;
  role: 'Candidate';
  profileVisibility: 'public' | 'private'; // ✅ New field
  currentRole?: string;
  location?: string;
  skills?: string[];
  yearsOfExperience?: number;
  isShortlisted?: boolean; // ✅ Saved to user doc
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Query Logic
```typescript
// Step 1: Query all candidates
query(
  collection(firestore, 'users'),
  where('role', '==', 'Candidate'),
  orderBy('updatedAt', 'desc')
)

// Step 2: Filter public profiles
candidates.filter(user => 
  user.profileVisibility === 'public' || !user.profileVisibility
)

// Step 3: Apply user filters (search, skills, experience, location)
// Step 4: Sort and display
```

## UI Components

### Filters Sidebar
- Search input with icon
- Skills dropdown (dynamic from all candidates)
- Experience dropdown (predefined ranges)
- Location dropdown (dynamic from all candidates)
- Shortlisted checkbox
- Clear filters button

### Top 10 Matches Card
- Numbered badges (1-10)
- Avatar + name + role
- Fit score badge
- Click to view profile

### Candidate Cards
- Avatar, name, role
- Email, location, experience
- Skills badges (first 3 + count)
- Fit score badge (if available)
- Action buttons: Shortlist, Message, Connect

### Table View
- Sortable columns
- Avatar + name + email
- Applied job, stage, fit score
- Last updated date
- Click row to view profile

## Testing Checklist

- [x] Query all users with role='Candidate'
- [x] Filter by profileVisibility='public'
- [x] Real-time updates via onSnapshot
- [x] Search by name/email/role
- [x] Filter by skills
- [x] Filter by experience range
- [x] Filter by location
- [x] Filter by shortlisted status
- [x] Clear all filters
- [x] Sort by updatedAt (default)
- [x] Top 10 matches by fit score
- [x] Card view display
- [x] Table view display
- [x] Toggle between views
- [x] Shortlist/unshortlist candidates
- [x] Send message to candidate
- [x] Send connection request
- [x] View candidate profile

## Files Modified

1. **src/app/(app)/candidates/page.tsx**
   - Changed query from org candidates to all users
   - Added profileVisibility filter
   - Updated shortlist to save to users collection
   - Added displayName, role context variables
   - Improved data mapping for user fields

2. **src/lib/definitions.ts**
   - Added `profileVisibility?: 'public' | 'private'` to User type
   - Added optional fields: currentRole, location, skills, yearsOfExperience, isShortlisted
   - Added createdAt, updatedAt timestamps

## Real-time Architecture

```
Firestore users collection (onSnapshot)
    ↓
useCollection hook
    ↓
Filter: role === 'Candidate' && profileVisibility === 'public'
    ↓
Apply user filters (search, skills, experience, location)
    ↓
Sort by updatedAt / fitScore
    ↓
Render cards/table
    ↓
Auto re-render on data changes
```

## Privacy & Security

### Profile Visibility
- **Public**: Visible to all employers
- **Private**: Hidden from search (future feature)
- **Default**: Public (for existing users)

### Data Access
- Employers can see: Name, email, role, skills, experience, location
- Employers cannot see: Password, private notes, application history (unless applied to their org)

### Shortlist Privacy
- Shortlist status saved per candidate
- Not visible to candidate
- Shared across organization (future: per-user shortlists)

## Performance Optimizations

1. **Memoization**: All filters use `useMemo` to prevent unnecessary recalculations
2. **Lazy Loading**: Only load applications when needed
3. **Indexed Queries**: Firestore indexes on role + updatedAt
4. **Client-side Filtering**: profileVisibility filter done client-side (Firestore limitation)

## Future Enhancements

1. **Advanced Search**: Full-text search with Algolia
2. **Saved Searches**: Save filter combinations
3. **Bulk Actions**: Shortlist/message multiple candidates
4. **Export**: Export candidate list to CSV
5. **AI Recommendations**: "Candidates you might like"
6. **Profile Completeness**: Show profile completion percentage

## Summary

✅ **All Public Profiles**: Shows all candidates with profileVisibility='public'
✅ **Real-time Updates**: onSnapshot listener for live data
✅ **Sorting**: By updatedAt, fitScore
✅ **Filtering**: Search, skills, experience, location, shortlisted
✅ **Views**: Card and table views
✅ **Actions**: Shortlist, message, connect

The Candidates tab now shows all public candidate profiles with real-time updates and comprehensive filtering!
