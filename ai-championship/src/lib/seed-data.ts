export const SEED_USERS = [
  // Candidates - Indian
  { id: 'user-1', name: 'Priya Sharma', email: 'priya.sharma@gmail.com', role: 'Candidate', title: 'Full Stack Developer', location: 'Bangalore, India', experience: 3, skills: ['React', 'Node.js', 'MongoDB'], bio: 'Passionate developer with 3 years of experience in building scalable web applications.' },
  { id: 'user-2', name: 'Rahul Verma', email: 'rahul.verma@gmail.com', role: 'Candidate', title: 'Frontend Developer', location: 'Mumbai, India', experience: 2, skills: ['React', 'TypeScript', 'CSS'], bio: 'Creative frontend developer specializing in modern UI/UX.' },
  { id: 'user-3', name: 'Anjali Patel', email: 'anjali.patel@gmail.com', role: 'Candidate', title: 'Backend Developer', location: 'Ahmedabad, India', experience: 4, skills: ['Python', 'Django', 'PostgreSQL'], bio: 'Backend specialist with expertise in API development.' },
  { id: 'user-4', name: 'Vikram Singh', email: 'vikram.singh@gmail.com', role: 'Candidate', title: 'DevOps Engineer', location: 'Delhi, India', experience: 5, skills: ['AWS', 'Docker', 'Kubernetes'], bio: 'DevOps engineer passionate about automation and cloud infrastructure.' },
  { id: 'user-5', name: 'Sneha Reddy', email: 'sneha.reddy@gmail.com', role: 'Candidate', title: 'Data Scientist', location: 'Hyderabad, India', experience: 3, skills: ['Python', 'ML', 'TensorFlow'], bio: 'Data scientist with focus on machine learning and AI.' },
  
  // Candidates - US
  { id: 'user-6', name: 'John Smith', email: 'john.smith@gmail.com', role: 'Candidate', title: 'Senior Software Engineer', location: 'San Francisco, USA', experience: 7, skills: ['Java', 'Spring', 'Microservices'], bio: 'Senior engineer with extensive experience in enterprise applications.' },
  { id: 'user-7', name: 'Emily Johnson', email: 'emily.johnson@gmail.com', role: 'Candidate', title: 'UI/UX Designer', location: 'New York, USA', experience: 4, skills: ['Figma', 'Adobe XD', 'Design Systems'], bio: 'Creative designer focused on user-centered design.' },
  { id: 'user-8', name: 'Michael Brown', email: 'michael.brown@gmail.com', role: 'Candidate', title: 'Mobile Developer', location: 'Austin, USA', experience: 5, skills: ['React Native', 'iOS', 'Android'], bio: 'Mobile developer building cross-platform applications.' },
  { id: 'user-9', name: 'Sarah Davis', email: 'sarah.davis@gmail.com', role: 'Candidate', title: 'Product Manager', location: 'Seattle, USA', experience: 6, skills: ['Agile', 'Product Strategy', 'Analytics'], bio: 'Product manager with track record of successful launches.' },
  { id: 'user-10', name: 'David Wilson', email: 'david.wilson@gmail.com', role: 'Candidate', title: 'QA Engineer', location: 'Boston, USA', experience: 4, skills: ['Selenium', 'Jest', 'Automation'], bio: 'QA engineer ensuring quality through automated testing.' },
  
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
