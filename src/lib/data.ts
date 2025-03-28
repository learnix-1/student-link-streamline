
import { v4 as uuidv4 } from 'uuid';
import { User, Student, Company, School, Placement, PlacementOfficer, DashboardStats } from '../types';

// Master Admin account
export const masterAdmin: User = {
  id: uuidv4(),
  name: 'Master Admin',
  email: 'admin@haca.com',
  role: 'master_admin',
};

// Schools data
export const schools: School[] = [
  { 
    id: uuidv4(), 
    name: 'Technology Institute', 
    location: 'San Francisco, CA',
  },
  { 
    id: uuidv4(), 
    name: 'Business School', 
    location: 'New York, NY',
  },
  { 
    id: uuidv4(), 
    name: 'Design Academy', 
    location: 'Los Angeles, CA',
  },
];

// Project Leads
export const projectLeads: User[] = [
  {
    id: uuidv4(),
    name: 'John Davis',
    email: 'john@techinstitute.edu',
    phone: '(555) 123-4567',
    role: 'project_lead',
    school_id: schools[0].id,
  },
  {
    id: uuidv4(),
    name: 'Sarah Johnson',
    email: 'sarah@businessschool.edu',
    phone: '(555) 234-5678',
    role: 'project_lead',
    school_id: schools[1].id,
  },
  {
    id: uuidv4(),
    name: 'Michael Wong',
    email: 'michael@designacademy.edu',
    phone: '(555) 345-6789',
    role: 'project_lead',
    school_id: schools[2].id,
  },
];

// Update school project leads
schools[0].project_lead_id = projectLeads[0].id;
schools[1].project_lead_id = projectLeads[1].id;
schools[2].project_lead_id = projectLeads[2].id;

// Placement Officers
export const placementOfficers: PlacementOfficer[] = [
  {
    id: uuidv4(),
    name: 'Emily Chen',
    email: 'emily@techinstitute.edu',
    phone: '(555) 456-7890',
    school_id: schools[0].id,
    school_name: schools[0].name,
  },
  {
    id: uuidv4(),
    name: 'Robert Smith',
    email: 'robert@techinstitute.edu',
    phone: '(555) 567-8901',
    school_id: schools[0].id,
    school_name: schools[0].name,
  },
  {
    id: uuidv4(),
    name: 'Jessica Brown',
    email: 'jessica@businessschool.edu',
    phone: '(555) 678-9012',
    school_id: schools[1].id,
    school_name: schools[1].name,
  },
  {
    id: uuidv4(),
    name: 'David Kim',
    email: 'david@designacademy.edu',
    phone: '(555) 789-0123',
    school_id: schools[2].id,
    school_name: schools[2].name,
  },
];

// Create users for placement officers
export const placementOfficerUsers: User[] = placementOfficers.map(officer => ({
  id: officer.id,
  name: officer.name,
  email: officer.email,
  phone: officer.phone,
  role: 'placement_officer',
  school_id: officer.school_id,
}));

// Companies
export const companies: Company[] = [
  {
    id: uuidv4(),
    name: 'TechNova',
    contact_person: 'Alex Morgan',
    contact_email: 'alex@technova.com',
    contact_phone: '(555) 890-1234',
    collaboration_status: 'active',
    company_status: 'partner',
    job_roles_offered: ['Software Engineer', 'Product Manager', 'UX Designer'],
    created_at: new Date(2023, 1, 15).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Global Finance',
    contact_person: 'Patricia Lee',
    contact_email: 'patricia@globalfinance.com',
    contact_phone: '(555) 901-2345',
    collaboration_status: 'active',
    company_status: 'partner',
    job_roles_offered: ['Financial Analyst', 'Investment Banking Associate', 'Risk Manager'],
    created_at: new Date(2023, 2, 20).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'CreativeWorks',
    contact_person: 'James Wilson',
    contact_email: 'james@creativeworks.com',
    contact_phone: '(555) 012-3456',
    collaboration_status: 'active',
    company_status: 'prospect',
    job_roles_offered: ['Graphic Designer', 'Creative Director', 'Art Director'],
    created_at: new Date(2023, 3, 10).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'DataInsights',
    contact_person: 'Sophia Garcia',
    contact_email: 'sophia@datainsights.com',
    contact_phone: '(555) 123-4567',
    collaboration_status: 'inactive',
    company_status: 'former_partner',
    job_roles_offered: ['Data Scientist', 'Data Analyst', 'Machine Learning Engineer'],
    created_at: new Date(2023, 4, 5).toISOString(),
  },
];

// Students
export const students: Student[] = [
  // Technology Institute Students
  {
    id: uuidv4(),
    name: 'Ryan Parker',
    email: 'ryan@student.edu',
    phone: '(555) 234-5678',
    course: 'Computer Science',
    course_specialization: 'Software Development',
    school_id: schools[0].id,
    school_name: schools[0].name,
    placement_status: 'placed',
    student_status: 'completed',
    interviews_attended: 3,
    interview_results: 'Performed well in technical interviews. Strong problem-solving skills.',
    created_at: new Date(2023, 1, 10).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Olivia Martinez',
    email: 'olivia@student.edu',
    phone: '(555) 345-6789',
    course: 'Software Engineering',
    course_specialization: 'Web Development',
    school_id: schools[0].id,
    school_name: schools[0].name,
    placement_status: 'placed',
    student_status: 'completed',
    interviews_attended: 4,
    interview_results: 'Excellent coding skills and system design knowledge.',
    created_at: new Date(2023, 1, 12).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Ethan Lewis',
    email: 'ethan@student.edu',
    phone: '(555) 456-7890',
    course: 'Data Science',
    course_specialization: 'Machine Learning',
    school_id: schools[0].id,
    school_name: schools[0].name,
    placement_status: 'not_placed',
    student_status: 'seeking_placement',
    interviews_attended: 2,
    interview_results: 'Good theoretical knowledge, needs more practical experience.',
    created_at: new Date(2023, 1, 15).toISOString(),
  },
  
  // Business School Students
  {
    id: uuidv4(),
    name: 'Emma Thompson',
    email: 'emma@student.edu',
    phone: '(555) 567-8901',
    course: 'Business Administration',
    course_specialization: 'Marketing',
    school_id: schools[1].id,
    school_name: schools[1].name,
    placement_status: 'placed',
    student_status: 'completed',
    interviews_attended: 3,
    interview_results: 'Strong leadership qualities and analytical skills.',
    created_at: new Date(2023, 2, 5).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Daniel Clark',
    email: 'daniel@student.edu',
    phone: '(555) 678-9012',
    course: 'Finance',
    course_specialization: 'Investment Banking',
    school_id: schools[1].id,
    school_name: schools[1].name,
    placement_status: 'not_placed',
    student_status: 'seeking_placement',
    interviews_attended: 1,
    interview_results: 'Good understanding of financial concepts.',
    created_at: new Date(2023, 2, 8).toISOString(),
  },
  
  // Design Academy Students
  {
    id: uuidv4(),
    name: 'Ava Robinson',
    email: 'ava@student.edu',
    phone: '(555) 789-0123',
    course: 'Graphic Design',
    course_specialization: 'UI/UX Design',
    school_id: schools[2].id,
    school_name: schools[2].name,
    placement_status: 'placed',
    student_status: 'completed',
    interviews_attended: 2,
    interview_results: 'Impressive portfolio and creative thinking.',
    created_at: new Date(2023, 3, 12).toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Noah Harris',
    email: 'noah@student.edu',
    phone: '(555) 890-1234',
    course: 'UX Design',
    course_specialization: 'Interaction Design',
    school_id: schools[2].id,
    school_name: schools[2].name,
    placement_status: 'not_placed',
    student_status: 'seeking_placement',
    interviews_attended: 3,
    interview_results: 'Good design skills, needs to improve on user research methodologies.',
    created_at: new Date(2023, 3, 15).toISOString(),
  },
];

// Placements
export const placements: Placement[] = [
  {
    id: uuidv4(),
    student_id: students[0].id,
    student_name: students[0].name,
    company_id: companies[0].id,
    company_name: companies[0].name,
    placement_officer_id: placementOfficers[0].id,
    placement_officer_name: placementOfficers[0].name,
    placement_date: new Date(2023, 5, 10).toISOString(),
    status: 'completed',
  },
  {
    id: uuidv4(),
    student_id: students[1].id,
    student_name: students[1].name,
    company_id: companies[0].id,
    company_name: companies[0].name,
    placement_officer_id: placementOfficers[1].id,
    placement_officer_name: placementOfficers[1].name,
    placement_date: new Date(2023, 5, 15).toISOString(),
    status: 'completed',
  },
  {
    id: uuidv4(),
    student_id: students[3].id,
    student_name: students[3].name,
    company_id: companies[1].id,
    company_name: companies[1].name,
    placement_officer_id: placementOfficers[2].id,
    placement_officer_name: placementOfficers[2].name,
    placement_date: new Date(2023, 5, 20).toISOString(),
    status: 'completed',
  },
  {
    id: uuidv4(),
    student_id: students[5].id,
    student_name: students[5].name,
    company_id: companies[2].id,
    company_name: companies[2].name,
    placement_officer_id: placementOfficers[3].id,
    placement_officer_name: placementOfficers[3].name,
    placement_date: new Date(2023, 5, 25).toISOString(),
    status: 'completed',
  },
];

// Add extra placements for dashboard metrics
placements.push(
  {
    id: uuidv4(),
    student_id: students[2].id,
    student_name: students[2].name,
    company_id: companies[3].id,
    company_name: companies[3].name,
    placement_officer_id: placementOfficers[0].id,
    placement_officer_name: placementOfficers[0].name,
    placement_date: new Date(2023, 6, 5).toISOString(),
    status: 'in_progress',
  },
  {
    id: uuidv4(),
    student_id: students[4].id,
    student_name: students[4].name,
    company_id: companies[1].id,
    company_name: companies[1].name,
    placement_officer_id: placementOfficers[0].id,
    placement_officer_name: placementOfficers[0].name,
    placement_date: new Date(2023, 6, 10).toISOString(),
    status: 'in_progress',
  }
);

// Combine all users
export const users: User[] = [
  masterAdmin,
  ...projectLeads,
  ...placementOfficerUsers,
  // Add the new user for neema@haca.com
  {
    id: uuidv4(),
    name: 'Neema',
    email: 'neema@haca.com',
    role: 'placement_officer',
    school_id: schools[0].id,
  }
];

// Dashboard statistics
export const dashboardStats: DashboardStats = {
  totalStudents: students.length,
  placedStudents: students.filter(student => student.placement_status === 'placed').length,
  activeCompanies: companies.filter(company => company.collaboration_status === 'active').length,
  placementRate: Math.round((students.filter(student => student.placement_status === 'placed').length / students.length) * 100),
  recentPlacements: placements.sort((a, b) => new Date(b.placement_date).getTime() - new Date(a.placement_date).getTime()).slice(0, 5),
};

// Helper function to authenticate user
export const authenticateUser = (email: string, password: string): User | null => {
  if (email === masterAdmin.email && password === 'password') {
    return masterAdmin;
  }
  
  if (email === 'neema@haca.com' && password === 'password') {
    return users.find(u => u.email === 'neema@haca.com') || null;
  }
  
  const user = users.find(user => user.email === email && password === 'password');
  return user || null;
};

// Function to get data based on user role and school
export const getUserData = (user: User) => {
  if (!user) return null;
  
  if (user.role === 'master_admin') {
    return {
      schools,
      students,
      companies,
      placements,
      users: [...projectLeads, ...placementOfficerUsers],
      placementOfficers,
      stats: dashboardStats
    };
  }
  
  if (user.role === 'project_lead' && user.school_id) {
    const schoolStudents = students.filter(student => student.school_id === user.school_id);
    const schoolOfficers = placementOfficers.filter(officer => officer.school_id === user.school_id);
    const officerIds = schoolOfficers.map(officer => officer.id);
    const schoolPlacements = placements.filter(placement => 
      schoolStudents.some(student => student.id === placement.student_id) ||
      officerIds.includes(placement.placement_officer_id)
    );
    
    return {
      schools: schools.filter(school => school.id === user.school_id),
      students: schoolStudents,
      companies,
      placements: schoolPlacements,
      users: [
        ...projectLeads.filter(lead => lead.school_id === user.school_id),
        ...placementOfficerUsers.filter(officer => officer.school_id === user.school_id)
      ],
      placementOfficers: schoolOfficers,
      stats: {
        totalStudents: schoolStudents.length,
        placedStudents: schoolStudents.filter(student => student.placement_status === 'placed').length,
        activeCompanies: companies.filter(company => company.collaboration_status === 'active').length,
        placementRate: schoolStudents.length > 0 
          ? Math.round((schoolStudents.filter(student => student.placement_status === 'placed').length / schoolStudents.length) * 100)
          : 0,
        recentPlacements: schoolPlacements.sort((a, b) => 
          new Date(b.placement_date).getTime() - new Date(a.placement_date).getTime()
        ).slice(0, 5),
      }
    };
  }
  
  if (user.role === 'placement_officer' && user.school_id) {
    const schoolStudents = students.filter(student => student.school_id === user.school_id);
    const officerPlacements = placements.filter(placement => placement.placement_officer_id === user.id);
    
    return {
      schools: schools.filter(school => school.id === user.school_id),
      students: schoolStudents,
      companies,
      placements: officerPlacements,
      users: [],
      placementOfficers: placementOfficers.filter(officer => officer.id === user.id),
      stats: {
        totalStudents: schoolStudents.length,
        placedStudents: schoolStudents.filter(student => student.placement_status === 'placed').length,
        activeCompanies: companies.filter(company => company.collaboration_status === 'active').length,
        placementRate: schoolStudents.length > 0 
          ? Math.round((schoolStudents.filter(student => student.placement_status === 'placed').length / schoolStudents.length) * 100)
          : 0,
        recentPlacements: officerPlacements.sort((a, b) => 
          new Date(b.placement_date).getTime() - new Date(a.placement_date).getTime()
        ).slice(0, 5),
      }
    };
  }
  
  return null;
};
