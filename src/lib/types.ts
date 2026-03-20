export type UserRole = 'graduate' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
}

export interface Graduate {
  user_id: string;
  student_number: string;
  full_name: string;
  course_of_study: string;
  skills: string[];
  cv_url?: string;
  bio?: string;
  graduation_year?: number;
}

export interface Employer {
  user_id: string;
  company_name: string;
  industry?: string;
  website?: string;
  description?: string;
  location?: string;
}

export type JobStatus = 'pending' | 'active' | 'closed';
export type ApplicationStatus = 'applied' | 'shortlisted' | 'rejected';

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  requirements: string[];
  salary_range?: string;
  location?: string;
  status: JobStatus;
  created_at: string;
  company_name?: string;
  industry?: string;
}

export interface Application {
  id: string;
  job_id: string;
  graduate_id: string;
  status: ApplicationStatus;
  applied_at: string;
  job?: Job;
  graduate?: Graduate;
}
