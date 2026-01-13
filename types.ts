
export enum Status {
  New = 'New',
  InProgress = 'In Progress',
  InReview = 'In Review',
  Shortlisted = 'Shortlisted',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Read = 'Read',
  Archived = 'Archived',
}

export interface JobApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  position: string;
  resumeUrl: string;
  coverLetter: string;
  status: Status;
  createdAt: string;
}

export interface AdmissionApplication {
  id: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  grade: string;
  city: string;
  previousSchool: string;
  message: string;
  status: Status;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  status: Status;
  createdAt: string;
}

export interface JobPost {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  type: string; // Full-time, Part-time, Contract
  requirements: string;
  salary?: string;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationWithJob {
  id: string;
  jobPostId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  position: string;
  resumeUrl: string;
  coverLetter: string;
  status: Status;
  createdAt: string;
}
