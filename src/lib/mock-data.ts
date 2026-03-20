import { Job, Application, Graduate, Employer } from './types';

export const mockJobs: Job[] = [
  {
    id: '1', employer_id: 'e1', title: 'Junior Accountant',
    description: 'We are looking for a detail-oriented junior accountant to join our finance team. You will assist with financial reporting, reconciliation, and tax preparation.',
    requirements: ['Accounting', 'Excel', 'Financial Reporting', 'QuickBooks'],
    salary_range: 'UGX 800,000 - 1,200,000', location: 'Kampala',
    status: 'active', created_at: '2026-03-10', company_name: 'Deloitte Uganda', industry: 'Accounting'
  },
  {
    id: '2', employer_id: 'e2', title: 'Software Developer',
    description: 'Join our growing tech team to build web and mobile applications for clients across East Africa.',
    requirements: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
    salary_range: 'UGX 1,500,000 - 2,500,000', location: 'Kampala',
    status: 'active', created_at: '2026-03-12', company_name: 'Andela Uganda', industry: 'Technology'
  },
  {
    id: '3', employer_id: 'e3', title: 'Marketing Associate',
    description: 'Help us grow our brand presence in Uganda through digital and traditional marketing campaigns.',
    requirements: ['Marketing', 'Social Media', 'Content Writing', 'Analytics'],
    salary_range: 'UGX 700,000 - 1,000,000', location: 'Kabale',
    status: 'active', created_at: '2026-03-14', company_name: 'MTN Uganda', industry: 'Telecommunications'
  },
  {
    id: '4', employer_id: 'e1', title: 'Audit Intern',
    description: 'A 6-month internship program for fresh graduates interested in pursuing a career in auditing.',
    requirements: ['Accounting', 'Attention to Detail', 'Communication'],
    salary_range: 'UGX 400,000 - 600,000', location: 'Kampala',
    status: 'active', created_at: '2026-03-15', company_name: 'KPMG Uganda', industry: 'Professional Services'
  },
  {
    id: '5', employer_id: 'e2', title: 'Data Analyst',
    description: 'Analyze business data to help drive strategic decisions for our rapidly expanding operations.',
    requirements: ['Excel', 'SQL', 'Python', 'Data Visualization'],
    salary_range: 'UGX 1,200,000 - 1,800,000', location: 'Kampala',
    status: 'active', created_at: '2026-03-13', company_name: 'Stanbic Bank', industry: 'Banking'
  },
  {
    id: '6', employer_id: 'e3', title: 'Teaching Assistant',
    description: 'Support lecturers in the Department of Education at a leading university in Western Uganda.',
    requirements: ['Education', 'Communication', 'Research', 'Curriculum Development'],
    salary_range: 'UGX 600,000 - 900,000', location: 'Kabale',
    status: 'active', created_at: '2026-03-11', company_name: 'Bishop Barham UC', industry: 'Education'
  },
];

export const mockApplications: Application[] = [
  { id: 'a1', job_id: '1', graduate_id: 'g1', status: 'applied', applied_at: '2026-03-12', job: mockJobs[0] },
  { id: 'a2', job_id: '2', graduate_id: 'g1', status: 'shortlisted', applied_at: '2026-03-13', job: mockJobs[1] },
  { id: 'a3', job_id: '3', graduate_id: 'g1', status: 'rejected', applied_at: '2026-03-11', job: mockJobs[2] },
];

export const mockGraduate: Graduate = {
  user_id: 'g1', student_number: 'BBUC/2022/1234', full_name: 'Sarah Ainembabazi',
  course_of_study: 'Bachelor of Business Administration', skills: ['Accounting', 'Excel', 'Financial Reporting', 'Communication'],
  bio: 'A dedicated BBA graduate from BBUC with a passion for finance and accounting.', graduation_year: 2025,
};

export const mockEmployer: Employer = {
  user_id: 'e1', company_name: 'Deloitte Uganda', industry: 'Professional Services',
  website: 'https://deloitte.com', description: 'One of the Big Four accounting firms operating in Uganda.',
  location: 'Kampala',
};

export const statsData = {
  totalGraduates: 1247,
  totalEmployers: 89,
  totalJobs: 156,
  totalApplications: 3420,
  placementRate: 34,
  hiredThisMonth: 42,
  topSkills: [
    { name: 'Accounting', count: 89 },
    { name: 'Excel', count: 76 },
    { name: 'Communication', count: 65 },
    { name: 'JavaScript', count: 54 },
    { name: 'Marketing', count: 48 },
    { name: 'SQL', count: 41 },
  ],
  monthlyHires: [
    { month: 'Oct', hires: 18 },
    { month: 'Nov', hires: 24 },
    { month: 'Dec', hires: 15 },
    { month: 'Jan', hires: 32 },
    { month: 'Feb', hires: 38 },
    { month: 'Mar', hires: 42 },
  ],
};
