import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import { User, School, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Users = () => {
  const { userData, role } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    role: 'placement_officer',
    school_id: '',
    password: ''
  });
  
  useEffect(() => {
    if (userData) {
      setUsers(userData.users);
    }
  }, [userData]);

  useEffect(() => {
    const setupRealtimeUsers = async () => {
      const channel = supabase
        .channel('users-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'users' }, 
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setUsers(prevUsers => [...prevUsers, payload.new as User]);
            } else if (payload.eventType === 'UPDATE') {
              setUsers(prevUsers => 
                prevUsers.map(user => user.id === payload.new.id ? payload.new as User : user)
              );
            } else if (payload.eventType === 'DELETE') {
              setUsers(prevUsers => 
                prevUsers.filter(user => user.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: 'placement_officer',
      school_id: '',
      password: ''
    });
  };

  const handleAdd = () => {
    setIsDialogOpen(true);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: {
          full_name: newUser.name,
          phone: newUser.phone,
          role: newUser.role,
          school_id: newUser.school_id
        }
      });

      if (error) {
        throw error;
      }

      toast.success('User added successfully');
      setIsDialogOpen(false);
      resetForm();
      
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user. This is a demo; in production, you would use Supabase Auth API.');
      
      const newId = Math.random().toString(36).substring(2, 11);
      const createdUser: User = {
        id: newId,
        name: newUser.name!,
        email: newUser.email!,
        phone: newUser.phone,
        role: newUser.role as UserRole,
        school_id: newUser.school_id
      };
      
      setUsers(prev => [...prev, createdUser]);
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (user: User) => {
    toast.success('This is a demo. User editing would be implemented here.');
  };

  const handleDelete = async (user: User) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(
        user.id
      );
      
      if (error) {
        throw error;
      }
      
      toast.success('User deleted successfully');
      
      setUsers(prev => prev.filter(u => u.id !== user.id));
      
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user. This is a demo; in production, you would use Supabase Auth API.');
      
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const pageTitle = role === 'master_admin' ? 'Users' : 'Placement Officers';

  const userColumns = [
    { header: 'Name', accessor: 'name' as keyof User },
    { header: 'Email', accessor: 'email' as keyof User },
    { header: 'Phone', accessor: 'phone' as keyof User },
    { 
      header: 'Role', 
      accessor: 'role' as keyof User,
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
        const school = userData?.schools.find((s: School) => s.id === row.school_id);
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

  if (!userData) return null;
  
  const { schools } = userData;

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
                <Input 
                  id="name" 
                  name="name"
                  placeholder="Enter full name" 
                  value={newUser.name || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  placeholder="Enter email address" 
                  type="email" 
                  value={newUser.email || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  placeholder="Enter phone number" 
                  value={newUser.phone || ''}
                  onChange={handleInputChange}
                />
              </div>
              {role === 'master_admin' && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={newUser.role || 'placement_officer'} 
                    onValueChange={(value) => handleSelectChange('role', value)}
                  >
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
              <Select 
                value={newUser.school_id || ''} 
                onValueChange={(value) => handleSelectChange('school_id', value)}
              >
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
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password"
                placeholder="Set user password" 
                type="password" 
                value={newUser.password || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add {role === 'master_admin' ? 'User' : 'Placement Officer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Users;
