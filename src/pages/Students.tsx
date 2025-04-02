
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import { Student, School, StudentStatus, PlacementStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Students = () => {
  const { userData } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    email: '',
    phone: '',
    course: '',
    course_specialization: '',
    school_id: '',
    student_status: 'ongoing_course',
    placement_status: 'not_placed'
  });
  
  useEffect(() => {
    if (userData) {
      // Make sure to set default values for any missing student_status fields
      const updatedStudents = userData.students.map((student: any) => ({
        ...student,
        student_status: student.student_status || 'ongoing_course',
        course_specialization: student.course_specialization || ''
      })) as Student[];
      
      setStudents(updatedStudents);
    }
  }, [userData]);

  useEffect(() => {
    const setupRealtimeStudents = async () => {
      const channel = supabase
        .channel('students-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'students' }, 
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setStudents(prevStudents => [...prevStudents, payload.new as Student]);
            } else if (payload.eventType === 'UPDATE') {
              setStudents(prevStudents => 
                prevStudents.map(student => student.id === payload.new.id ? payload.new as Student : student)
              );
            } else if (payload.eventType === 'DELETE') {
              setStudents(prevStudents => 
                prevStudents.filter(student => student.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeStudents();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      course: '',
      course_specialization: '',
      school_id: '',
      student_status: 'ongoing_course',
      placement_status: 'not_placed'
    });
    setEditingStudent(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      course: student.course || '',
      course_specialization: student.course_specialization || '',
      school_id: student.school_id || '',
      student_status: student.student_status || 'ongoing_course',
      placement_status: student.placement_status || 'not_placed'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (student: Student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', student.id);
          
        if (error) throw error;
        
        toast.success(`${student.name} has been deleted`);
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingStudent) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            course: formData.course,
            course_specialization: formData.course_specialization,
            school_id: formData.school_id || null,
            student_status: formData.student_status,
            placement_status: formData.placement_status
          })
          .eq('id', editingStudent.id);
          
        if (error) throw error;
        
        toast.success(`${formData.name} updated successfully`);
      } else {
        // Create new student
        const { error } = await supabase
          .from('students')
          .insert([{
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            course: formData.course,
            course_specialization: formData.course_specialization,
            school_id: formData.school_id || null,
            student_status: formData.student_status,
            placement_status: formData.placement_status
          }]);
          
        if (error) throw error;
        
        toast.success('Student added successfully');
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Failed to save student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusDisplay = (status: StudentStatus) => {
    switch (status) {
      case 'ongoing_course': return 'Ongoing Course';
      case 'ongoing_placed': return 'Ongoing and Placed';
      case 'finished_not_placed': return 'Finished and Not Placed';
      case 'finished_placed': return 'Finished and Placed';
      case 'placement_not_needed': return 'Placement Not Needed';
      default: return status;
    }
  };

  const getStatusColor = (status: StudentStatus) => {
    switch (status) {
      case 'ongoing_course': return 'bg-blue-500';
      case 'ongoing_placed': return 'bg-green-500';
      case 'finished_not_placed': return 'bg-amber-500';
      case 'finished_placed': return 'bg-green-500';
      case 'placement_not_needed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const studentColumns = [
    { header: 'Name', accessor: 'name' as keyof Student },
    { header: 'Email', accessor: 'email' as keyof Student },
    { header: 'Phone', accessor: 'phone' as keyof Student },
    { header: 'Course', accessor: 'course' as keyof Student },
    { header: 'Specialization', accessor: 'course_specialization' as keyof Student },
    { 
      header: 'Status', 
      accessor: 'student_status' as keyof Student,
      cell: (row: Student) => (
        <div className="flex items-center">
          <span 
            className={`inline-block w-2 h-2 rounded-full mr-2 ${getStatusColor(row.student_status)}`}
          />
          {getStatusDisplay(row.student_status)}
        </div>
      )
    },
    { 
      header: 'Placement', 
      accessor: 'placement_status' as keyof Student,
      cell: (row: Student) => (
        <div className="flex items-center">
          <span 
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              row.placement_status === 'placed' ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          {row.placement_status === 'placed' ? 'Placed' : 'Not Placed'}
        </div>
      )
    },
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

  if (!userData) return null;
  
  const { schools } = userData;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground mt-1">
              Manage student records and track their placement status
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
            <CardDescription>List of all students and their details</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={students} 
              columns={studentColumns} 
              searchField="name"
            />
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Student Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
            <DialogDescription>
              {editingStudent ? 'Update student details.' : 'Enter student details to add to the system.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Name*</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name" 
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email*</Label>
                  <Input 
                    id="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address" 
                    type="email"
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number" 
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="course">Course</Label>
                  <Input 
                    id="course" 
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    placeholder="Enter course name" 
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="course_specialization">Course Specialization</Label>
                <Input 
                  id="course_specialization" 
                  name="course_specialization"
                  value={formData.course_specialization}
                  onChange={handleInputChange}
                  placeholder="Enter course specialization" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="school_id">School</Label>
                  <Select
                    value={formData.school_id || 'none'}
                    onValueChange={(value) => handleSelectChange('school_id', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger id="school_id">
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="none">None</SelectItem>
                      {schools.map((school: School) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="student_status">Status</Label>
                  <Select
                    value={formData.student_status || 'ongoing_course'}
                    onValueChange={(value) => handleSelectChange('student_status', value)}
                  >
                    <SelectTrigger id="student_status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="ongoing_course">Ongoing Course</SelectItem>
                      <SelectItem value="ongoing_placed">Ongoing and Placed</SelectItem>
                      <SelectItem value="finished_not_placed">Finished and Not Placed</SelectItem>
                      <SelectItem value="finished_placed">Finished and Placed</SelectItem>
                      <SelectItem value="placement_not_needed">Placement Not Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="placement_status">Placement Status</Label>
                <Select
                  value={formData.placement_status || 'not_placed'}
                  onValueChange={(value) => handleSelectChange('placement_status', value)}
                >
                  <SelectTrigger id="placement_status">
                    <SelectValue placeholder="Select placement status" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="not_placed">Not Placed</SelectItem>
                    <SelectItem value="placed">Placed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Add Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Students;
