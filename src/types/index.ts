
export type UserRole = 'master_admin' | 'project_lead' | 'placement_officer' | string;

export type PlacementStatus = 'not_placed' | 'placed' | string;
export type CollaborationStatus = 'active' | 'inactive' | string;
export type PlacementProgressStatus = 'in_progress' | 'completed' | string;
export type CompanyStatus = 'prospect' | 'partner' | 'inactive' | 'former_partner' | string;
export type StudentStatus = 'studying' | 'completed' | 'seeking_placement' | 'not_seeking_placement' | string;

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  school_id?: string;
  password?: string; // Added for admin user creation
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  course_specialization?: string; // New field for student specialization
  school_id: string;
  school_name?: string;
  placement_status: PlacementStatus;
  student_status: StudentStatus; // New field for student course completion status
  interviews_attended: number;
  interview_results?: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  collaboration_status: CollaborationStatus;
  company_status: CompanyStatus; // New field for company status
  job_roles_offered: string[];
  created_at: string;
}

export interface Placement {
  id: string;
  student_id: string;
  student_name?: string;
  company_id: string;
  company_name?: string;
  placement_officer_id: string;
  placement_officer_name?: string;
  placement_date: string;
  status: PlacementProgressStatus;
}

export interface School {
  id: string;
  name: string;
  location: string;
  project_lead_id?: string;
}

export interface PlacementOfficer {
  id: string;
  name: string;
  email: string;
  phone: string;
  school_id: string;
  school_name?: string;
}

export interface OfficerMetrics {
  id: string;
  name: string;
  totalPlacements: number;
  completedPlacements: number;
  inProgressPlacements: number;
  companiesCollaborated: number;
  averagePlacementTime: number; // in days
  placementSuccessRate: number; // percentage
  lastPlacementDate: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
}

export interface DashboardStats {
  totalStudents: number;
  placedStudents: number;
  activeCompanies: number;
  placementRate: number;
  recentPlacements: Placement[];
}
