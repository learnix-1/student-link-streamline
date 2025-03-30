
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface AddInteractionDialogProps {
  companyId: string;
}

const AddInteractionDialog: React.FC<AddInteractionDialogProps> = ({ companyId }) => {
  const { userData } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    interaction_type: '',
    description: '',
    placement_officer_id: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!formData.interaction_type || !formData.description || !formData.placement_officer_id) {
        toast.error('Please fill in all fields');
        return;
      }
      
      const { error } = await supabase
        .from('company_interactions')
        .insert([
          {
            company_id: companyId,
            interaction_type: formData.interaction_type,
            description: formData.description,
            placement_officer_id: formData.placement_officer_id
          }
        ]);
        
      if (error) throw error;
      
      toast.success('Interaction added successfully');
      setOpen(false);
      setFormData({
        interaction_type: '',
        description: '',
        placement_officer_id: ''
      });
    } catch (error) {
      console.error('Error adding interaction:', error);
      toast.error('Failed to add interaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Interaction</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add Company Interaction</DialogTitle>
          <DialogDescription>
            Record a new interaction with this company.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="interaction_type">Interaction Type</Label>
              <Select
                value={formData.interaction_type}
                onValueChange={(value) => handleSelectChange('interaction_type', value)}
              >
                <SelectTrigger id="interaction_type">
                  <SelectValue placeholder="Select interaction type" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="site_visit">Site Visit</SelectItem>
                  <SelectItem value="job_fair">Job Fair</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="placement_officer_id">Placement Officer</Label>
              <Select
                value={formData.placement_officer_id}
                onValueChange={(value) => handleSelectChange('placement_officer_id', value)}
              >
                <SelectTrigger id="placement_officer_id">
                  <SelectValue placeholder="Select placement officer" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {userData && userData.users
                    .filter(user => user.role === 'placement_officer')
                    .map(officer => (
                      <SelectItem key={officer.id} value={officer.id}>
                        {officer.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter details about the interaction"
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Interaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInteractionDialog;
