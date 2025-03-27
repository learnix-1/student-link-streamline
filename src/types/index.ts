
export type UserRole = 'master_admin' | 'project_lead' | 'placement_officer' | string;

export type PlacementStatus = 'not_placed' | 'placed' | string;
export type CollaborationStatus = 'active' | 'inactive' | string;
export type PlacementProgressStatus = 'in_progress' | 'completed' | string;

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  school_id?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  school_id: string;
  school_name?: string;
  placement_status: PlacementStatus;
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
