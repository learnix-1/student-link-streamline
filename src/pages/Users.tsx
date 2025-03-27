
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import { User, School } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Users = () => {
  const { userData, role } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  if (!userData) return null;
  
  const { users, schools } = userData;

  const userColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { 
      header: 'Role', 
      accessor: 'role',
      cell: (row: User) => (
        <div className="flex items-center">
          <span 
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              row.role === 'master_admin' 
                ? 'bg-purple-100 text-purple-800' 
                : row.role === 'project_lead'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {row.role === 'master_admin' 
              ? 'Master Admin' 
              : row.role === 'project_lead'
              ? 'Project Lead'
              : 'Placement Officer'
            }
          </span>
        </div>
      )
    },
    { 
      header: 'School', 
      accessor: (row: User) => {
        if (!row.school_id) return 'All Schools';
        const school = schools.find((s: School) => s.id === row.school_id);
        return school ? school.name : 'Unknown';
      } 
    },
    { 
      header: 'Actions', 
      accessor: (row: User) => (
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
    toast.success('This is a demo. User creation would be implemented here.');
  };

  const handleEdit = (user: User) => {
    toast.success('This is a demo. User editing would be implemented here.');
  };

  const handleDelete = (user: User) => {
    toast.success('This is a demo. User deletion would be implemented here.');
  };

  const pageTitle = role === 'master_admin' ? 'Users' : 'Placement Officers';

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
            <p className="text-muted-foreground mt-1">
              {role === 'master_admin' 
                ? 'Manage all system users and their roles' 
                : 'Manage placement officers for your school'}
            </p>
          </div>
          <Button onClick={handleAdd} className="hover-transition">
            <Plus className="mr-2 h-4 w-4" />
            Add {role === 'master_admin' ? 'User' : 'Placement Officer'}
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">User Records</CardTitle>
            <CardDescription>
              {role === 'master_admin' 
                ? 'Complete list of system users and their access levels' 
                : 'List of placement officers for your school'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={role === 'master_admin' ? users : users.filter((u: User) => u.role === 'placement_officer')} 
              columns={userColumns} 
              searchField="name"
            />
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              Add New {role === 'master_admin' ? 'User' : 'Placement Officer'}
            </DialogTitle>
            <DialogDescription>
              Enter user details to add to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="Enter email address" type="email" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              {role === 'master_admin' && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="role">Role</Label>
                  <Select>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="project_lead">Project Lead</SelectItem>
                      <SelectItem value="placement_officer">Placement Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('User added successfully.');
              setIsDialogOpen(false);
            }}>
              Add {role === 'master_admin' ? 'User' : 'Placement Officer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Users;
