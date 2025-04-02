
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import { Placement, Student, Company, PlacementOfficer, PlacementStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Placements = () => {
  const { userData } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<Placement | null>(null);
  const [formData, setFormData] = useState<Partial<Placement>>({
    student_id: '',
    company_id: '',
    placement_officer_id: '',
    placement_date: new Date().toISOString().split('T')[0],
    status: 'in_progress'
  });
  
  useEffect(() => {
    if (userData) {
      setPlacements(userData.placements);
    }
  }, [userData]);

  useEffect(() => {
    const setupRealtimePlacements = async () => {
      const channel = supabase
        .channel('placements-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'placements' }, 
          (payload) => {
            if (payload.eventType === 'INSERT') {
              fetchPlacementDetails(payload.new.id);
            } else if (payload.eventType === 'UPDATE') {
              fetchPlacementDetails(payload.new.id);
            } else if (payload.eventType === 'DELETE') {
              setPlacements(prev => prev.filter(placement => placement.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimePlacements();
  }, []);

  const fetchPlacementDetails = async (placementId: string) => {
    try {
      const { data, error } = await supabase
        .from('placements')
        .select(`
          *,
          students!placements_student_id_fkey (id, name),
          companies!placements_company_id_fkey (id, name),
          placement_officers!placements_placement_officer_id_fkey (id, name)
        `)
        .eq('id', placementId)
        .single();

      if (error) throw error;

      if (data) {
        const formattedPlacement: Placement = {
          id: data.id,
          student_id: data.student_id,
          student_name: data.students?.name,
          company_id: data.company_id,
          company_name: data.companies?.name,
          placement_officer_id: data.placement_officer_id,
          placement_officer_name: data.placement_officers?.name,
          placement_date: data.placement_date,
          status: data.status
        };

        setPlacements(prev => {
          const exists = prev.some(p => p.id === formattedPlacement.id);
          if (exists) {
            return prev.map(p => p.id === formattedPlacement.id ? formattedPlacement : p);
          } else {
            return [...prev, formattedPlacement];
          }
        });
      }
    } catch (error) {
      console.error('Error fetching placement details:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      company_id: '',
      placement_officer_id: '',
      placement_date: new Date().toISOString().split('T')[0],
      status: 'in_progress'
    });
    setEditingPlacement(null);
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

  const handleEdit = (placement: Placement) => {
    setEditingPlacement(placement);
    setFormData({
      student_id: placement.student_id,
      company_id: placement.company_id,
      placement_officer_id: placement.placement_officer_id,
      placement_date: new Date(placement.placement_date).toISOString().split('T')[0],
      status: placement.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (placement: Placement) => {
    if (window.confirm(`Are you sure you want to delete this placement?`)) {
      try {
        const { error } = await supabase
          .from('placements')
          .delete()
          .eq('id', placement.id);
          
        if (error) throw error;
        
        toast.success('Placement deleted successfully');
      } catch (error) {
        console.error('Error deleting placement:', error);
        toast.error('Failed to delete placement');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.student_id || !formData.company_id || !formData.placement_officer_id || !formData.placement_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingPlacement) {
        // Update existing placement
        const { error } = await supabase
          .from('placements')
          .update({
            student_id: formData.student_id,
            company_id: formData.company_id,
            placement_officer_id: formData.placement_officer_id,
            placement_date: formData.placement_date,
            status: formData.status
          })
          .eq('id', editingPlacement.id);
          
        if (error) throw error;
        
        toast.success('Placement updated successfully');
        
        // If status changed to completed, update student placement status
        if (formData.status === 'completed' && editingPlacement.status !== 'completed') {
          await updateStudentPlacementStatus(formData.student_id, 'placed');
        }
      } else {
        // Create new placement
        const { data, error } = await supabase
          .from('placements')
          .insert([{
            student_id: formData.student_id,
            company_id: formData.company_id,
            placement_officer_id: formData.placement_officer_id,
            placement_date: formData.placement_date,
            status: formData.status
          }])
          .select();
          
        if (error) throw error;
        
        toast.success('Placement added successfully');
        
        // If status is completed, update student placement status
        if (formData.status === 'completed') {
          await updateStudentPlacementStatus(formData.student_id, 'placed');
        }
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving placement:', error);
      toast.error('Failed to save placement');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateStudentPlacementStatus = async (studentId: string, status: PlacementStatus) => {
    try {
      await supabase
        .from('students')
        .update({ placement_status: status })
        .eq('id', studentId);
    } catch (error) {
      console.error('Error updating student status:', error);
    }
  };

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

  if (!userData) return null;
  
  const { students, companies, placementOfficers } = userData;

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

      {/* Add/Edit Placement Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingPlacement ? 'Edit Placement' : 'Add New Placement'}</DialogTitle>
            <DialogDescription>
              {editingPlacement ? 'Update placement details.' : 'Record a new student placement with a company.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="student_id">Student*</Label>
                  <Select
                    value={formData.student_id || ''}
                    onValueChange={(value) => handleSelectChange('student_id', value)}
                    required
                  >
                    <SelectTrigger id="student_id">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {students
                        .filter((s: Student) => editingPlacement?.student_id === s.id || s.placement_status === 'not_placed')
                        .map((student: Student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="company_id">Company*</Label>
                  <Select
                    value={formData.company_id || ''}
                    onValueChange={(value) => handleSelectChange('company_id', value)}
                    required
                  >
                    <SelectTrigger id="company_id">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {companies
                        .filter((c: Company) => c.collaboration_status === 'active')
                        .map((company: Company) => (
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
                  <Label htmlFor="placement_officer_id">Placement Officer*</Label>
                  <Select
                    value={formData.placement_officer_id || ''}
                    onValueChange={(value) => handleSelectChange('placement_officer_id', value)}
                    required
                  >
                    <SelectTrigger id="placement_officer_id">
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
                  <Label htmlFor="placement_date">Placement Date*</Label>
                  <Input 
                    id="placement_date" 
                    name="placement_date"
                    type="date"
                    value={formData.placement_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || 'in_progress'}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
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
                {isSubmitting ? 'Saving...' : editingPlacement ? 'Update Placement' : 'Add Placement'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Placements;
