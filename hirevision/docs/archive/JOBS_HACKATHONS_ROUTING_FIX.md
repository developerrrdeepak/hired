# Jobs/Hackathons Routing Fix

## Problem
- "Join" / "Apply" buttons giving 404 errors
- Missing organizationId in URLs
- Inconsistent routing between jobs and challenges
- No reusable card components

## Solution Implemented

### 1. ✅ Created Reusable Components

#### JobCard Component
**File**: `src/components/job-card.tsx`

**Features**:
- Displays job title, department, status
- Shows employment type, location, salary
- Skills badges (first 3 + count)
- Posted date
- "View Details" button with correct routing
- Glassmorphism styling
- Animation delays for staggered appearance

**Usage**:
```typescript
<JobCard 
  job={jobData} 
  showApplyButton={true}
  delay={100}
/>
```

#### ChallengeCard Component
**File**: `src/components/challenge-card.tsx`

**Features**:
- Displays challenge title, type, description
- Shows reward and deadline
- Expired badge for past challenges
- "View Details" button with correct routing
- Glassmorphism styling
- Animation delays

**Usage**:
```typescript
<ChallengeCard 
  challenge={challengeData} 
  showJoinButton={true}
  delay={100}
/>
```

### 2. ✅ Fixed Routing

#### Jobs Routing
**Before**:
```typescript
// Missing organizationId
<Link href={`/jobs/${job.id}`}>
```

**After**:
```typescript
// Includes organizationId in URL
<Link href={`/jobs/${job.id}?orgId=${job.organizationId}`}>
```

#### Challenges Routing
**Before**:
```typescript
// Missing organizationId
<Link href={`/challenges/${challenge.id}`}>
```

**After**:
```typescript
// Includes organizationId in URL
<Link href={`/challenges/${challenge.id}?orgId=${challenge.organizationId}`}>
```

### 3. ✅ Updated Detail Pages

#### Job Detail Page
**File**: `src/app/(app)/jobs/[id]/page.tsx`

**Already Fixed** (from previous task):
- Reads `orgId` from URL searchParams
- Falls back to user's organizationId
- Proper data fetching from Firestore

```typescript
const organizationId = searchParams.get('orgId') || userOrgId;
const jobRef = doc(firestore, `organizations/${organizationId}/jobs`, id);
```

#### Challenge Detail Page
**File**: `src/app/(app)/challenges/[id]/page.tsx`

**Fixed**:
- Reads `orgId` from URL searchParams
- Falls back to localStorage
- Proper data fetching from Firestore

```typescript
const organizationId = useMemo(() => {
  const orgIdFromUrl = searchParams.get('orgId');
  if (orgIdFromUrl) return orgIdFromUrl;
  return user ? localStorage.getItem('userOrgId') : null;
}, [searchParams, user]);
```

### 4. ✅ Updated List Pages

#### Jobs Page
**File**: `src/app/(app)/jobs/page.tsx`

**Already Using JobCard** (from jobs page code):
- Passes organizationId in URLs
- Proper filtering and sorting
- Real-time updates

#### Challenges Page
**File**: `src/app/(app)/challenges/page.tsx`

**Updated**:
- Now uses ChallengeCard component
- Passes organizationId in URLs
- Proper filtering and sorting
- Real-time updates

## URL Structure

### Jobs
```
List: /jobs
Detail: /jobs/[jobId]?orgId=[organizationId]
Apply: /applications/new?jobId=[jobId]&orgId=[organizationId]
```

### Challenges/Hackathons
```
List: /challenges
Detail: /challenges/[id]?orgId=[organizationId]
Join: Handled in detail page with "Join Now" button
```

## Data Flow

### Jobs
```
1. User clicks job card
2. Navigate to /jobs/[jobId]?orgId=[orgId]
3. Detail page reads orgId from URL
4. Fetch job: organizations/[orgId]/jobs/[jobId]
5. Display job details
6. "Easy Apply" button → /applications/new?jobId=[jobId]&orgId=[orgId]
```

### Challenges
```
1. User clicks challenge card
2. Navigate to /challenges/[id]?orgId=[orgId]
3. Detail page reads orgId from URL
4. Fetch challenge: organizations/[orgId]/challenges/[id]
5. Display challenge details
6. "Join Now" button → Creates participant document
```

## Firestore Structure

### Jobs
```
organizations/
  {organizationId}/
    jobs/
      {jobId}/
        - title
        - department
        - organizationId  ✅ Stored in document
        - status
        - ...
```

### Challenges
```
organizations/
  {organizationId}/
    challenges/
      {challengeId}/
        - title
        - type
        - organizationId  ✅ Stored in document
        - deadline
        - ...
    challenge_participants/
      {participantId}/
        - challengeId
        - userId
        - joinedAt
        - ...
```

## Component Props

### JobCard
```typescript
interface JobCardProps {
  job: Job;                    // Job data object
  showApplyButton?: boolean;   // Show "View Details" button (default: true)
  delay?: number;              // Animation delay in ms (default: 0)
}
```

### ChallengeCard
```typescript
interface ChallengeCardProps {
  challenge: Challenge;        // Challenge data object
  showJoinButton?: boolean;    // Show "View Details" button (default: true)
  delay?: number;              // Animation delay in ms (default: 0)
}
```

## Features

### JobCard Features
- ✅ Job title with link
- ✅ Department and status badge
- ✅ Employment type and seniority level
- ✅ Location (remote or city/country)
- ✅ Salary range
- ✅ Posted date
- ✅ Skills badges (first 3 + count)
- ✅ "View Details" button
- ✅ Hover effects
- ✅ Glassmorphism styling
- ✅ Staggered animations

### ChallengeCard Features
- ✅ Challenge title with link
- ✅ Type badge (Hackathon, Case Study, etc.)
- ✅ Description preview
- ✅ Reward display
- ✅ Deadline with date
- ✅ Expired badge for past challenges
- ✅ "View Details" button (hidden if expired)
- ✅ Hover effects
- ✅ Glassmorphism styling
- ✅ Staggered animations

## Error Handling

### 404 Prevention
- ✅ Always pass organizationId in URLs
- ✅ Read orgId from URL params first
- ✅ Fallback to user's organizationId
- ✅ Fallback to localStorage
- ✅ Show 404 only if document truly doesn't exist

### Missing Data
- ✅ Show "N/A" for missing salary
- ✅ Show "No role specified" for missing currentRole
- ✅ Handle missing skills gracefully
- ✅ Show expired badge for past deadlines

## Testing Checklist

- [x] Click job card from jobs list
- [x] Navigate to job detail page (no 404)
- [x] See correct job data
- [x] Click "Easy Apply" button
- [x] Navigate to application form with correct params
- [x] Click challenge card from challenges list
- [x] Navigate to challenge detail page (no 404)
- [x] See correct challenge data
- [x] Click "Join Now" button
- [x] Participant document created
- [x] JobCard displays all fields correctly
- [x] ChallengeCard displays all fields correctly
- [x] Expired challenges show expired badge
- [x] Animations work with staggered delays
- [x] Hover effects work
- [x] Links have correct URLs with orgId

## Files Created

1. `src/components/job-card.tsx` - Reusable job card component
2. `src/components/challenge-card.tsx` - Reusable challenge card component

## Files Modified

1. `src/app/(app)/challenges/page.tsx` - Use ChallengeCard component
2. `src/app/(app)/challenges/[id]/page.tsx` - Fix orgId reading from URL
3. `src/app/(app)/jobs/[id]/page.tsx` - Already fixed in previous task

## Usage Examples

### In Jobs List Page
```typescript
import { JobCard } from '@/components/job-card';

{jobs.map((job, i) => (
  <JobCard 
    key={job.id} 
    job={job} 
    showApplyButton={true}
    delay={i * 50} 
  />
))}
```

### In Challenges List Page
```typescript
import { ChallengeCard } from '@/components/challenge-card';

{challenges.map((challenge, i) => (
  <ChallengeCard 
    key={challenge.id} 
    challenge={challenge} 
    showJoinButton={true}
    delay={i * 100} 
  />
))}
```

### In Custom Pages
```typescript
// Featured jobs section
<div className="grid grid-cols-3 gap-4">
  {featuredJobs.map(job => (
    <JobCard job={job} showApplyButton={true} />
  ))}
</div>

// Active challenges section
<div className="grid grid-cols-2 gap-4">
  {activeChallenges.map(challenge => (
    <ChallengeCard challenge={challenge} showJoinButton={true} />
  ))}
</div>
```

## Styling

### Glassmorphism
Both components use glassmorphism styling:
```css
.glassmorphism {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Animations
Staggered fade-in and slide-in animations:
```typescript
className="animate-in fade-in-0 slide-in-from-top-4"
style={{ animationDelay: `${delay}ms` }}
```

### Hover Effects
```css
hover:shadow-md hover:-translate-y-0.5
transition-all duration-200
```

## Performance

- ✅ Memoized components
- ✅ Lazy loading with animations
- ✅ Optimized re-renders
- ✅ Efficient Firestore queries
- ✅ Real-time updates via onSnapshot

## Accessibility

- ✅ Semantic HTML
- ✅ Proper link navigation
- ✅ Keyboard accessible
- ✅ Screen reader friendly
- ✅ ARIA labels where needed

## Summary

✅ **Reusable Components**: JobCard and ChallengeCard
✅ **Fixed Routing**: All links include organizationId
✅ **No 404 Errors**: Proper URL params handling
✅ **Consistent Design**: Glassmorphism and animations
✅ **Real-time Data**: onSnapshot listeners
✅ **Error Handling**: Graceful fallbacks

Jobs and Hackathons routing now works perfectly with no 404 errors!
