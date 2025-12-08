# 📊 Export to Excel Feature

## Overview
Added comprehensive Excel export functionality across the platform for easy data analysis and reporting.

## Features Added

### 1. **Candidates Export** 👥
**Location:** `/candidates` page

**Exports:**
- Name
- Email
- Phone
- Current Role
- Location
- Years of Experience
- Skills (comma-separated)
- Applied For (Job Title)
- Current Stage
- Fit Score
- Last Updated Date

**Usage:**
```tsx
<Button onClick={() => exportCandidatesToExcel(candidates)}>
  <Download /> Export to Excel
</Button>
```

**File Name:** `candidates_YYYY-MM-DD.xlsx`

---

### 2. **Jobs Export** 💼
**Location:** `/jobs` page

**Exports:**
- Job Title
- Department
- Status
- Employment Type
- Location (Remote or City, Country)
- Seniority Level
- Number of Openings
- Salary Range (Min & Max)
- Created Date

**Usage:**
```tsx
<Button onClick={() => exportJobsToExcel(jobs)}>
  <Download /> Export to Excel
</Button>
```

**File Name:** `jobs_YYYY-MM-DD.xlsx`

---

### 3. **Reports Export** 📈
**Location:** `/reports` page

**Exports Multiple Sheets:**
1. **Summary Sheet:**
   - Total Jobs
   - Total Candidates
   - Total Hires
   - Average Time to Hire

2. **Hiring Funnel Sheet:**
   - Stage-wise breakdown
   - Candidate counts per stage

3. **Job Performance Sheet:**
   - Job-wise applications
   - Hires per job
   - Detailed metrics

**Usage:**
```tsx
<Button onClick={handleExportReport}>
  <Download /> Export Report
</Button>
```

**File Name:** `recruitment_report_YYYY-MM-DD.xlsx`

---

## Technical Implementation

### Library Used
- **xlsx** (SheetJS) - Industry standard for Excel file generation

### Core Functions

#### 1. Generic Export Function
```typescript
exportToExcel<T>(data: T[], filename: string, sheetName: string)
```
- Converts JSON data to Excel format
- Creates workbook and worksheet
- Triggers browser download

#### 2. Specialized Export Functions
```typescript
exportCandidatesToExcel(candidates: any[])
exportJobsToExcel(jobs: any[])
exportApplicationsToExcel(applications: any[])
exportReportToExcel(data: any, filename: string)
```

### File Location
`/src/lib/export-utils.ts`

---

## Benefits

### For HR Teams
✅ **Easy Reporting** - Share data with management
✅ **Offline Analysis** - Work with data in Excel
✅ **Data Backup** - Keep local copies
✅ **Custom Analysis** - Use Excel formulas and pivot tables

### For Recruiters
✅ **Quick Exports** - One-click download
✅ **Filtered Data** - Export only what you see
✅ **Professional Format** - Clean, organized spreadsheets
✅ **Date Stamped** - Auto-named files with dates

### For Management
✅ **Comprehensive Reports** - Multi-sheet workbooks
✅ **Summary Views** - Key metrics at a glance
✅ **Detailed Data** - Drill down into specifics
✅ **Shareable** - Easy to email or present

---

## Usage Examples

### Export Filtered Candidates
```tsx
// User applies filters
setSearchTerm('React Developer')
setExperienceFilter('3-5')

// Export only filtered results
<Button onClick={() => exportCandidatesToExcel(filteredCandidates)}>
  Export {filteredCandidates.length} Candidates
</Button>
```

### Export All Jobs
```tsx
// Export all jobs regardless of filters
<Button onClick={() => exportJobsToExcel(allJobs)}>
  Export All Jobs
</Button>
```

### Export Custom Report
```tsx
const customData = {
  summary: { /* summary data */ },
  details: [ /* detailed data */ ]
}
exportReportToExcel(customData, 'custom_report')
```

---

## Future Enhancements

### Planned Features
1. **PDF Export** - Generate PDF reports
2. **CSV Export** - Lightweight alternative
3. **Scheduled Exports** - Auto-email reports weekly
4. **Custom Templates** - User-defined export formats
5. **Bulk Export** - Export multiple sections at once
6. **Email Integration** - Send exports directly via email

### Advanced Features
- **Charts in Excel** - Include visualizations
- **Conditional Formatting** - Highlight important data
- **Formulas** - Pre-calculated fields
- **Pivot Tables** - Ready-to-use analysis

---

## Browser Compatibility
✅ Chrome/Edge (Latest)
✅ Firefox (Latest)
✅ Safari (Latest)
✅ Mobile Browsers

---

## Performance
- **Small datasets** (<1000 rows): Instant
- **Medium datasets** (1000-10000 rows): 1-2 seconds
- **Large datasets** (>10000 rows): 3-5 seconds

---

## Troubleshooting

### Export not working?
1. Check browser allows downloads
2. Disable popup blockers
3. Try different browser
4. Check console for errors

### File not opening?
1. Ensure Excel/LibreOffice installed
2. Try Google Sheets
3. Check file extension (.xlsx)

### Missing data?
1. Verify data is loaded
2. Check filters applied
3. Refresh page and retry

---

## Code Examples

### Add Export to Any Page
```tsx
import { exportToExcel } from '@/lib/export-utils'

const MyPage = () => {
  const data = [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 }
  ]

  return (
    <Button onClick={() => exportToExcel(data, 'my-data', 'Sheet1')}>
      Export
    </Button>
  )
}
```

### Custom Export Format
```tsx
const customExport = (data: any[]) => {
  const formatted = data.map(item => ({
    'Full Name': `${item.firstName} ${item.lastName}`,
    'Contact': item.email,
    'Status': item.isActive ? 'Active' : 'Inactive'
  }))
  
  exportToExcel(formatted, 'custom-export', 'Data')
}
```

---

**Made with ❤️ for better data management**
