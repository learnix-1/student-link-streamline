
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import { Company } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Companies = () => {
  const { userData } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  if (!userData) return null;
  
  const { companies } = userData;

  const companyColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Contact Person', accessor: 'contact_person' },
    { header: 'Contact Email', accessor: 'contact_email' },
    { 
      header: 'Status', 
      accessor: 'collaboration_status',
      cell: (row: Company) => (
        <div className="flex items-center">
          <span 
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              row.collaboration_status === 'active' ? 'bg-green-500' : 'bg-slate-400'
            }`}
          />
          {row.collaboration_status === 'active' ? 'Active' : 'Inactive'}
        </div>
      )
    },
    { 
      header: 'Job Roles', 
      accessor: (row: Company) => (
        <div className="flex flex-wrap gap-1">
          {row.job_roles_offered.map((role, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground">
              {role}
            </span>
          ))}
        </div>
      )
    },
    { 
      header: 'Actions', 
      accessor: (row: Company) => (
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
    toast.success('This is a demo. Company creation would be implemented here.');
  };

  const handleEdit = (company: Company) => {
    toast.success('This is a demo. Company editing would be implemented here.');
  };

  const handleDelete = (company: Company) => {
    toast.success('This is a demo. Company deletion would be implemented here.');
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
            <p className="text-muted-foreground mt-1">
              Manage company partnerships and collaborations
            </p>
          </div>
          <Button onClick={handleAdd} className="hover-transition">
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Company Records</CardTitle>
            <CardDescription>Complete list of companies and their partnership details</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={companies} 
              columns={companyColumns} 
              searchField="name"
            />
          </CardContent>
        </Card>
      </div>

      {/* Add Company Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>
              Enter company details to add to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" placeholder="Enter company name" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input id="contactPerson" placeholder="Enter contact person" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Contact Email</Label>
                <Input id="email" placeholder="Enter email address" type="email" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="status">Collaboration Status</Label>
                <Select>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="roles">Job Roles Offered</Label>
                <Input id="roles" placeholder="E.g. Developer, Designer (comma separated)" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Company added successfully.');
              setIsDialogOpen(false);
            }}>
              Add Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Companies;
