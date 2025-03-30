
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { School, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const SchoolsAdd = () => {
  const { userData, role } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<School>>({
    name: '',
    location: '',
    project_lead_id: ''
  });

  if (!userData) return null;

  // Only project leads and master admins can add schools
  if (role !== 'master_admin' && role !== 'project_lead') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You do not have permission to access this page.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  const projectLeads = userData.users.filter(
    (user: User) => user.role === 'project_lead'
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert([{
          name: formData.name,
          location: formData.location,
          project_lead_id: formData.project_lead_id || null
        }])
        .select();
        
      if (error) throw error;
      
      toast.success('School added successfully');
      setFormData({
        name: '',
        location: '',
        project_lead_id: ''
      });
      
    } catch (error) {
      console.error('Error adding school:', error);
      toast.error('Failed to add school');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New School</h1>
          <p className="text-muted-foreground mt-1">
            Create a new school in the placement management system
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">School Details</CardTitle>
            <CardDescription>
              Enter the details of the new school
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">School Name*</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Enter school name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location*</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    placeholder="City, State"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="project_lead_id">Project Lead</Label>
                  <Select
                    value={formData.project_lead_id || ''}
                    onValueChange={(value) => handleSelectChange('project_lead_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project lead" />
                    </SelectTrigger>
                    <SelectContent>
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
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ name: '', location: '', project_lead_id: '' })}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add School'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SchoolsAdd;
