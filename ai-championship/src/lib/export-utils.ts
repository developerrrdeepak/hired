import * as XLSX from 'xlsx';

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Sheet1'
) {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportCandidatesToExcel(candidates: any[]) {
  const exportData = candidates.map(c => ({
    'Name': c.name || '',
    'Email': c.email || '',
    'Phone': c.phone || '',
    'Current Role': c.currentRole || '',
    'Location': c.location || '',
    'Experience (Years)': c.yearsOfExperience || 0,
    'Skills': c.skills?.join(', ') || '',
    'Applied For': c.jobTitle || '',
    'Stage': c.stage || '',
    'Fit Score': c.fitScore || '',
    'Last Updated': c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '',
  }));

  exportToExcel(exportData, `candidates_${new Date().toISOString().split('T')[0]}`, 'Candidates');
}

export function exportJobsToExcel(jobs: any[]) {
  const exportData = jobs.map(j => ({
    'Job Title': j.title || '',
    'Department': j.department || '',
    'Status': j.status || '',
    'Employment Type': j.employmentType || '',
    'Location': j.isRemote ? 'Remote' : `${j.locationCity}, ${j.locationCountry}`,
    'Seniority': j.seniorityLevel || '',
    'Openings': j.numberOfOpenings || 0,
    'Salary Min': j.salaryRangeMin || '',
    'Salary Max': j.salaryRangeMax || '',
    'Created': j.createdAt ? new Date(j.createdAt).toLocaleDateString() : '',
  }));

  exportToExcel(exportData, `jobs_${new Date().toISOString().split('T')[0]}`, 'Jobs');
}

export function exportApplicationsToExcel(applications: any[]) {
  const exportData = applications.map(a => ({
    'Candidate': a.candidateName || '',
    'Job': a.jobTitle || '',
    'Stage': a.stage || '',
    'Status': a.status || '',
    'Applied Date': a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '',
    'Last Updated': a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : '',
    'Fit Score': a.fitScore || '',
  }));

  exportToExcel(exportData, `applications_${new Date().toISOString().split('T')[0]}`, 'Applications');
}

export function exportReportToExcel(data: any, filename: string) {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  if (data.summary) {
    const summaryWs = XLSX.utils.json_to_sheet([data.summary]);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  }

  // Detailed data sheets
  Object.keys(data).forEach(key => {
    if (key !== 'summary' && Array.isArray(data[key])) {
      const ws = XLSX.utils.json_to_sheet(data[key]);
      XLSX.utils.book_append_sheet(wb, ws, key);
    }
  });

  XLSX.writeFile(wb, `${filename}.xlsx`);
}
