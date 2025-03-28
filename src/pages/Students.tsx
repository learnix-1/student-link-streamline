
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import { Student, School, StudentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Students = () => {
  const { userData } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
    
    // Set up real-time listeners
    const studentsChannel = supabase
      .channel('students-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'students' }, 
        () => {
          console.log('Students table changed, refreshing data...');
          fetchData();
        }
      )
      .subscribe();
    
    const schoolsChannel = supabase
      .channel('schools-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'schools' }, 
        () => {
          console.log('Schools table changed, refreshing data...');
          fetchData();
        }
      )
      .subscribe();
    
    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(studentsChannel);
      supabase.removeChannel(schoolsChannel);
    };
  }, []);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*');
      
      if (studentsError) throw studentsError;
      
      // Fetch schools
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*');
      
      if (schoolsError) throw schoolsError;
      
      setStudents(studentsData || []);
      setSchools(schoolsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load student data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const studentColumns = [
    { header: 'Name', accessor: 'name' as keyof Student },
    { header: 'Email', accessor: 'email' as keyof Student },
    { header: 'Course', accessor: 'course' as keyof Student },
    { header: 'Specialization', accessor: 'course_specialization' as keyof Student },
    { 
      header: 'School', 
      accessor: (row: Student) => {
        const school = schools.find((s: School) => s.id === row.school_id);
        return school ? school.name : 'Unknown';
      }
    },
    { 
      header: 'Placement Status', 
      accessor: 'placement_status' as keyof Student,
      cell: (row: Student) => (
        <div className="flex items-center">
          <span 
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              row.placement_status === 'placed' ? 'bg-green-500' : 'bg-amber-500'
            }`}
          />
          {row.placement_status === 'placed' ? 'Placed' : 'Not Placed'}
        </div>
      )
    },
    { 
      header: 'Student Status', 
      accessor: 'student_status' as keyof Student,
      cell: (row: Student) => (
        <div className="flex items-center">
          <span 
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              row.student_status === 'seeking_placement' ? 'bg-blue-500' : 
              row.student_status === 'completed' ? 'bg-green-500' : 
              row.student_status === 'not_seeking_placement' ? 'bg-gray-500' : 'bg-amber-500'
            }`}
          />
          {row.student_status === 'studying' ? 'Studying' : 
           row.student_status === 'completed' ? 'Course Completed' :
           row.student_status === 'seeking_placement' ? 'Seeking Placement' :
           row.student_status === 'not_seeking_placement' ? 'Not Seeking Placement' : 'Unknown'}
        </div>
      )
    },
    { header: 'Interviews', accessor: 'interviews_attended' as keyof Student },
    { 
      header: 'Actions', 
      accessor: (row: Student) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  ];

  const handleAdd = () => {
    setIsDialogOpen(true);
  };

  const handleEdit = (student: Student) => {
    toast.success('This is a demo. Student editing would be implemented here.');
  };

  const handleDelete = (student: Student) => {
    toast.success('This is a demo. Student deletion would be implemented here.');
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track student information
            </p>
          </div>
          <Button onClick={handleAdd} className="hover-transition">
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Student Records</CardTitle>
            <CardDescription>Comprehensive list of students and their placement status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading students...</p>
              </div>
            ) : (
              <DataTable 
                data={students} 
                columns={studentColumns} 
                searchField="name"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter student details to add them to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter student name" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="Enter student email" type="email" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="course">Course</Label>
                <Input id="course" placeholder="Enter course name" />
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="specialization">Course Specialization</Label>
              <Input id="specialization" placeholder="Enter course specialization" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="school">School</Label>
                <Select>
                  <SelectTrigger id="school">
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {schools.map((school: School) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="placement_status">Placement Status</Label>
                <Select>
                  <SelectTrigger id="placement_status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="not_placed">Not Placed</SelectItem>
                    <SelectItem value="placed">Placed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="student_status">Student Status</Label>
                <Select>
                  <SelectTrigger id="student_status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="studying">Studying</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="seeking_placement">Seeking Placement</SelectItem>
                    <SelectItem value="not_seeking_placement">Not Seeking Placement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="interviews">Interviews Attended</Label>
                <Input id="interviews" type="number" min="0" defaultValue="0" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Student added successfully.');
              setIsDialogOpen(false);
            }}>
              Add Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Students;
