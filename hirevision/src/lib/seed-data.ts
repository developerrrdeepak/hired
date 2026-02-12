export const SEED_USERS = [
  // Candidates - Indian
  { id: 'user-1', name: 'Priya Sharma', displayName: 'Priya Sharma', email: 'priya.sharma@gmail.com', role: 'Candidate', currentRole: 'Full Stack Developer', location: 'Bangalore, India', yearsOfExperience: 3, skills: ['React', 'Node.js', 'MongoDB'], bio: 'Passionate developer with 3 years of experience in building scalable web applications.', phone: '+91-9876543210' },
  { id: 'user-2', name: 'Rahul Verma', displayName: 'Rahul Verma', email: 'rahul.verma@gmail.com', role: 'Candidate', currentRole: 'Frontend Developer', location: 'Mumbai, India', yearsOfExperience: 2, skills: ['React', 'TypeScript', 'CSS'], bio: 'Creative frontend developer specializing in modern UI/UX.', phone: '+91-9876543211' },
  { id: 'user-3', name: 'Anjali Patel', displayName: 'Anjali Patel', email: 'anjali.patel@gmail.com', role: 'Candidate', currentRole: 'Backend Developer', location: 'Ahmedabad, India', yearsOfExperience: 4, skills: ['Python', 'Django', 'PostgreSQL'], bio: 'Backend specialist with expertise in API development.', phone: '+91-9876543212' },
  { id: 'user-4', name: 'Vikram Singh', displayName: 'Vikram Singh', email: 'vikram.singh@gmail.com', role: 'Candidate', currentRole: 'DevOps Engineer', location: 'Delhi, India', yearsOfExperience: 5, skills: ['AWS', 'Docker', 'Kubernetes'], bio: 'DevOps engineer passionate about automation and cloud infrastructure.', phone: '+91-9876543213' },
  { id: 'user-5', name: 'Sneha Reddy', displayName: 'Sneha Reddy', email: 'sneha.reddy@gmail.com', role: 'Candidate', currentRole: 'Data Scientist', location: 'Hyderabad, India', yearsOfExperience: 3, skills: ['Python', 'ML', 'TensorFlow'], bio: 'Data scientist with focus on machine learning and AI.', phone: '+91-9876543214' },
  
  // Candidates - US
  { id: 'user-6', name: 'John Smith', displayName: 'John Smith', email: 'john.smith@gmail.com', role: 'Candidate', currentRole: 'Senior Software Engineer', location: 'San Francisco, USA', yearsOfExperience: 7, skills: ['Java', 'Spring', 'Microservices'], bio: 'Senior engineer with extensive experience in enterprise applications.', phone: '+1-415-555-0101' },
  { id: 'user-7', name: 'Emily Johnson', displayName: 'Emily Johnson', email: 'emily.johnson@gmail.com', role: 'Candidate', currentRole: 'UI/UX Designer', location: 'New York, USA', yearsOfExperience: 4, skills: ['Figma', 'Adobe XD', 'Design Systems'], bio: 'Creative designer focused on user-centered design.', phone: '+1-212-555-0102' },
  { id: 'user-8', name: 'Michael Brown', displayName: 'Michael Brown', email: 'michael.brown@gmail.com', role: 'Candidate', currentRole: 'Mobile Developer', location: 'Austin, USA', yearsOfExperience: 5, skills: ['React Native', 'iOS', 'Android'], bio: 'Mobile developer building cross-platform applications.', phone: '+1-512-555-0103' },
  { id: 'user-9', name: 'Sarah Davis', displayName: 'Sarah Davis', email: 'sarah.davis@gmail.com', role: 'Candidate', currentRole: 'Product Manager', location: 'Seattle, USA', yearsOfExperience: 6, skills: ['Agile', 'Product Strategy', 'Analytics'], bio: 'Product manager with track record of successful launches.', phone: '+1-206-555-0104' },
  { id: 'user-10', name: 'David Wilson', displayName: 'David Wilson', email: 'david.wilson@gmail.com', role: 'Candidate', currentRole: 'QA Engineer', location: 'Boston, USA', yearsOfExperience: 4, skills: ['Selenium', 'Jest', 'Automation'], bio: 'QA engineer ensuring quality through automated testing.', phone: '+1-617-555-0105' },
  
  // Recruiters - Indian
  { id: 'user-11', name: 'Amit Kumar', email: 'amit.kumar@techcorp.in', role: 'Recruiter', title: 'Senior Recruiter', location: 'Bangalore, India', company: 'TechCorp India' },
  { id: 'user-12', name: 'Neha Gupta', email: 'neha.gupta@innovate.in', role: 'Recruiter', title: 'Talent Acquisition Lead', location: 'Pune, India', company: 'Innovate Solutions' },
  
  // Recruiters - US
  { id: 'user-13', name: 'Jennifer Lee', email: 'jennifer.lee@techgiant.com', role: 'Recruiter', title: 'Technical Recruiter', location: 'San Francisco, USA', company: 'TechGiant Inc' },
  { id: 'user-14', name: 'Robert Martinez', email: 'robert.martinez@startup.io', role: 'Recruiter', title: 'Head of Talent', location: 'New York, USA', company: 'Startup.io' },
  
  // Owners
  { id: 'user-15', name: 'Rajesh Khanna', email: 'rajesh@hirevision.in', role: 'Owner', title: 'CEO', location: 'Mumbai, India', company: 'HireVision India' },
  { id: 'user-16', name: 'Lisa Anderson', email: 'lisa@hirevision.com', role: 'Owner', title: 'Founder & CEO', location: 'San Francisco, USA', company: 'HireVision USA' },
];

export const SEED_JOBS = [
  { id: 'job-1', title: 'Senior Full Stack Developer', company: 'TechCorp India', location: 'Bangalore, India', type: 'Full-time', salary: '₹20-30 LPA', description: 'Looking for experienced full stack developer', skills: ['React', 'Node.js', 'AWS'], postedBy: 'user-11' },
  { id: 'job-2', title: 'Frontend Developer', company: 'Innovate Solutions', location: 'Pune, India', type: 'Full-time', salary: '₹12-18 LPA', description: 'Join our frontend team', skills: ['React', 'TypeScript'], postedBy: 'user-12' },
  { id: 'job-3', title: 'Software Engineer', company: 'TechGiant Inc', location: 'San Francisco, USA', type: 'Full-time', salary: '$120k-180k', description: 'Build next-gen products', skills: ['Java', 'Spring', 'Microservices'], postedBy: 'user-13' },
  { id: 'job-4', title: 'Product Designer', company: 'Startup.io', location: 'New York, USA', type: 'Full-time', salary: '$100k-140k', description: 'Design beautiful products', skills: ['Figma', 'UI/UX'], postedBy: 'user-14' },
  { id: 'job-5', title: 'DevOps Engineer', company: 'HireVision India', location: 'Mumbai, India', type: 'Full-time', salary: '₹18-25 LPA', description: 'Manage cloud infrastructure', skills: ['AWS', 'Docker', 'Kubernetes'], postedBy: 'user-15' },
];

export const SEED_POSTS = [
  { id: 'post-1', authorId: 'user-1', authorName: 'Priya Sharma', type: 'achievement', title: 'Completed AWS Certification!', content: 'Just passed my AWS Solutions Architect exam! Excited to apply cloud skills in real projects. 🎉', likes: [], comments: [] },
  { id: 'post-2', authorId: 'user-6', authorName: 'John Smith', type: 'project', title: 'Open Source Contribution', content: 'Contributed to React core library. Check out my PR on GitHub!', likes: [], comments: [] },
  { id: 'post-3', authorId: 'user-11', authorName: 'Amit Kumar', type: 'job', title: 'Hiring Full Stack Developers', content: 'We are hiring! Multiple positions open for full stack developers in Bangalore.', likes: [], comments: [] },
  { id: 'post-4', authorId: 'user-7', authorName: 'Emily Johnson', type: 'article', title: 'Design Trends 2024', content: 'Here are the top UI/UX trends I am seeing in 2024. Minimalism is back!', likes: [], comments: [] },
];

export const SEED_CONNECTIONS = [
  { id: 'conn-1', requesterId: 'user-1', receiverId: 'user-11', status: 'accepted' },
  { id: 'conn-2', requesterId: 'user-2', receiverId: 'user-12', status: 'accepted' },
  { id: 'conn-3', requesterId: 'user-6', receiverId: 'user-13', status: 'accepted' },
  { id: 'conn-4', requesterId: 'user-3', receiverId: 'user-11', status: 'pending' },
];

