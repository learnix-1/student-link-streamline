
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import { School, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';

const Schools = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  useEffect(() => {
    if (userData) {
      setSchools(userData.schools);
    }
  }, [userData]);

  useEffect(() => {
    const setupRealtimeSchools = async () => {
      const channel = supabase
        .channel('schools-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'schools' }, 
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setSchools(prevSchools => [...prevSchools, payload.new as School]);
            } else if (payload.eventType === 'UPDATE') {
              setSchools(prevSchools => 
                prevSchools.map(school => school.id === payload.new.id ? payload.new as School : school)
              );
            } else if (payload.eventType === 'DELETE') {
              setSchools(prevSchools => 
                prevSchools.filter(school => school.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSchools();
  }, []);

  const handleAdd = () => {
    navigate('/schools/add');
  };

  const handleEdit = (school: School) => {
    setSelectedSchool(school);
    setIsDialogOpen(true);
  };

  const handleDelete = async (school: School) => {
    if (window.confirm(`Are you sure you want to delete ${school.name}?`)) {
      try {
        const { error } = await supabase
          .from('schools')
          .delete()
          .eq('id', school.id);

        if (error) throw error;
        
        toast.success(`${school.name} has been deleted`);
      } catch (error) {
        console.error('Error deleting school:', error);
        toast.error('Failed to delete school');
      }
    }
  };

  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;

    try {
      const { error } = await supabase
        .from('schools')
        .update({
          name: selectedSchool.name,
          location: selectedSchool.location,
          project_lead_id: selectedSchool.project_lead_id
        })
        .eq('id', selectedSchool.id);

      if (error) throw error;
      
      toast.success(`${selectedSchool.name} updated successfully`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating school:', error);
      toast.error('Failed to update school');
    }
  };

  const getProjectLeadName = (leadId: string) => {
    if (!userData || !leadId) return 'Not Assigned';
    
    const lead = userData.users.find((user: User) => user.id === leadId);
    return lead ? lead.name : 'Not Assigned';
  };

  const schoolColumns = [
    { header: 'Name', accessor: 'name' as keyof School },
    { header: 'Location', accessor: 'location' as keyof School },
    { 
      header: 'Project Lead', 
      accessor: (row: School) => getProjectLeadName(row.project_lead_id || '') 
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

  if (!userData) return null;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schools</h1>
            <p className="text-muted-foreground mt-1">
              Manage educational institutions that are part of the placement program
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleAdd} className="hover-transition">
              <Plus className="mr-2 h-4 w-4" />
              Add School
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">School Records</CardTitle>
            <CardDescription>List of all schools and their details</CardDescription>
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

      {/* Edit School Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit School</DialogTitle>
            <DialogDescription>
              Update school details.
            </DialogDescription>
          </DialogHeader>
          {selectedSchool && (
            <form onSubmit={handleUpdateSchool}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">School Name</Label>
                  <Input 
                    id="name" 
                    value={selectedSchool.name} 
                    onChange={(e) => setSelectedSchool({...selectedSchool, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={selectedSchool.location || ''} 
                    onChange={(e) => setSelectedSchool({...selectedSchool, location: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_lead">Project Lead</Label>
                  <Select 
                    value={selectedSchool.project_lead_id || ''}
                    onValueChange={(value) => setSelectedSchool({...selectedSchool, project_lead_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project lead" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {userData.users
                        .filter((user: User) => user.role === 'project_lead')
                        .map((lead: User) => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Update School</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Schools;
