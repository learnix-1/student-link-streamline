
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import { Student, School } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Students = () => {
  const { userData } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  if (!userData) return null;
  
  const { students, schools } = userData;

  const studentColumns = [
    { header: 'Name', accessor: 'name' as keyof Student },
    { header: 'Email', accessor: 'email' as keyof Student },
    { header: 'Course', accessor: 'course' as keyof Student },
    { 
      header: 'School', 
      accessor: (row: Student) => {
        const school = schools.find((s: School) => s.id === row.school_id);
        return school ? school.name : 'Unknown';
      }
    },
    { 
      header: 'Status', 
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
    toast.success('This is a demo. Student creation would be implemented here.');
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
            <DataTable 
              data={students} 
              columns={studentColumns} 
              searchField="name"
            />
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
                <Label htmlFor="status">Placement Status</Label>
                <Select>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="not_placed">Not Placed</SelectItem>
                    <SelectItem value="placed">Placed</SelectItem>
                  </SelectContent>
                </Select>
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
