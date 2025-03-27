
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import { Placement, Student, Company, PlacementOfficer } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Placements = () => {
  const { userData } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  if (!userData) return null;
  
  const { placements, students, companies, placementOfficers } = userData;

  const placementColumns = [
    { header: 'Student', accessor: 'student_name' as keyof Placement },
    { header: 'Company', accessor: 'company_name' as keyof Placement },
    { 
      header: 'Placement Date', 
      accessor: (row: Placement) => new Date(row.placement_date).toLocaleDateString() 
    },
    { 
      header: 'Status', 
      accessor: 'status' as keyof Placement,
      cell: (row: Placement) => (
        <div className="flex items-center">
          <span 
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              row.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'
            }`}
          />
          {row.status === 'completed' ? 'Completed' : 'In Progress'}
        </div>
      )
    },
    { header: 'Placement Officer', accessor: 'placement_officer_name' as keyof Placement },
    { 
      header: 'Actions', 
      accessor: (row: Placement) => (
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
    toast.success('This is a demo. Placement creation would be implemented here.');
  };

  const handleEdit = (placement: Placement) => {
    toast.success('This is a demo. Placement editing would be implemented here.');
  };

  const handleDelete = (placement: Placement) => {
    toast.success('This is a demo. Placement deletion would be implemented here.');
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Placements</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage student placements
            </p>
          </div>
          <Button onClick={handleAdd} className="hover-transition">
            <Plus className="mr-2 h-4 w-4" />
            Add Placement
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Placement Records</CardTitle>
            <CardDescription>Records of student placements and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={placements} 
              columns={placementColumns} 
              searchField="student_name"
            />
          </CardContent>
        </Card>
      </div>

      {/* Add Placement Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Placement</DialogTitle>
            <DialogDescription>
              Record a new student placement with a company.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="student">Student</Label>
                <Select>
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {students.filter((s: Student) => s.placement_status === 'not_placed').map((student: Student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Select>
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {companies.filter((c: Company) => c.collaboration_status === 'active').map((company: Company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="officer">Placement Officer</Label>
                <Select>
                  <SelectTrigger id="officer">
                    <SelectValue placeholder="Select officer" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {placementOfficers.map((officer: PlacementOfficer) => (
                      <SelectItem key={officer.id} value={officer.id}>
                        {officer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="date">Placement Date</Label>
                <Input id="date" type="date" />
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Placement added successfully.');
              setIsDialogOpen(false);
            }}>
              Add Placement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Placements;
