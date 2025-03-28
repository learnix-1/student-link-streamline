
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import { School, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Schools = () => {
  const { userData, role } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    location: '',
    project_lead_id: ''
  });
  
  if (!userData || role !== 'master_admin') return null;
  
  const { schools, users } = userData;
  const projectLeads = users.filter((user: User) => user.role === 'project_lead');

  const schoolColumns = [
    { header: 'Name', accessor: 'name' as keyof School },
    { header: 'Location', accessor: 'location' as keyof School },
    { 
      header: 'Project Lead', 
      accessor: (row: School) => {
        if (!row.project_lead_id) return 'Not Assigned';
        const lead = projectLeads.find((u: User) => u.id === row.project_lead_id);
        return lead ? lead.name : 'Unknown';
      } 
    },
    { 
      header: 'Actions', 
      accessor: (row: School) => (
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewSchool(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setNewSchool(prev => ({
      ...prev,
      project_lead_id: value
    }));
  };

  const resetForm = () => {
    setNewSchool({
      name: '',
      location: '',
      project_lead_id: ''
    });
  };

  const handleAdd = () => {
    setIsDialogOpen(true);
    resetForm();
  };

  const handleEdit = (school: School) => {
    toast.success('This is a demo. School editing would be implemented here.');
  };

  const handleDelete = (school: School) => {
    toast.success('This is a demo. School deletion would be implemented here.');
  };

  const handleSubmit = () => {
    if (!newSchool.name || !newSchool.location) {
      toast.error('School name and location are required');
      return;
    }

    toast.success('School added successfully.');
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schools</h1>
            <p className="text-muted-foreground mt-1">
              Manage educational institutions in the system
            </p>
          </div>
          <Button onClick={handleAdd} className="hover-transition">
            <Plus className="mr-2 h-4 w-4" />
            Add School
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">School Records</CardTitle>
            <CardDescription>Complete list of schools in the placement system</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={schools} 
              columns={schoolColumns} 
              searchField="name"
            />
          </CardContent>
        </Card>
      </div>

      {/* Add School Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New School</DialogTitle>
            <DialogDescription>
              Enter school details to add to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">School Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter school name" 
                  value={newSchool.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="Enter school location" 
                  value={newSchool.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="project_lead_id">Project Lead</Label>
                <Select value={newSchool.project_lead_id} onValueChange={handleSelectChange}>
                  <SelectTrigger id="project_lead_id">
                    <SelectValue placeholder="Select project lead" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="">None</SelectItem>
                    {projectLeads.map((lead: User) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add School
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Schools;
