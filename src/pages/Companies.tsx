import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import { Company, CompanyStatus, CollaborationStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import InteractionsTimeline from '@/components/companies/InteractionsTimeline';
import AddInteractionDialog from '@/components/companies/AddInteractionDialog';
import { Textarea } from '@/components/ui/textarea';

const Companies = () => {
  const { userData } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    collaboration_status: 'active',
    company_status: 'partner',
    job_roles_offered: []
  });
  const [jobRolesInput, setJobRolesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchCompanies();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('companies-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'companies' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCompanies(prev => [...prev, payload.new as Company]);
          } else if (payload.eventType === 'UPDATE') {
            setCompanies(prev => 
              prev.map(company => company.id === payload.new.id ? payload.new as Company : company)
            );
            // If we're viewing this company's details, update the selected company
            if (selectedCompanyId === payload.new.id) {
              setSelectedCompany(payload.new as Company);
            }
          } else if (payload.eventType === 'DELETE') {
            setCompanies(prev => 
              prev.filter(company => company.id !== payload.old.id)
            );
            // If we're viewing the deleted company, go back to list view
            if (selectedCompanyId === payload.old.id) {
              setViewMode('list');
              setSelectedCompany(null);
              setSelectedCompanyId(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*');
      
      if (error) throw error;
      
      setCompanies(data as Company[] || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };
  
  const companyColumns = [
    { header: 'Name', accessor: 'name' as keyof Company },
    { header: 'Contact Person', accessor: 'contact_person' as keyof Company },
    { header: 'Contact Email', accessor: 'contact_email' as keyof Company },
    { 
      header: 'Collaboration Status', 
      accessor: 'collaboration_status' as keyof Company,
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
      header: 'Company Status', 
      accessor: 'company_status' as keyof Company,
      cell: (row: Company) => (
        <div className="flex items-center">
          <span 
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              row.company_status === 'partner' ? 'bg-green-500' :
              row.company_status === 'prospect' ? 'bg-blue-500' :
              row.company_status === 'former_partner' ? 'bg-amber-500' : 'bg-slate-400'
            }`}
          />
          {row.company_status === 'partner' ? 'Partner' :
           row.company_status === 'prospect' ? 'Prospect' :
           row.company_status === 'former_partner' ? 'Former Partner' : 'Inactive'}
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
          <Button variant="ghost" size="icon" onClick={(e) => {
            e.stopPropagation();
            viewCompanyDetails(row);
          }}>
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => {
            e.stopPropagation();
            handleEdit(row);
          }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => {
            e.stopPropagation();
            handleDelete(row);
          }}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  ];

  const viewCompanyDetails = (company: Company) => {
    setSelectedCompany(company);
    setSelectedCompanyId(company.id);
    setViewMode('detail');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      contact_person: '',
      contact_email: '',
      contact_phone: '',
      collaboration_status: 'active',
      company_status: 'partner',
      job_roles_offered: []
    });
    setJobRolesInput('');
    setIsDialogOpen(true);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      ...company,
    });
    setJobRolesInput(company.job_roles_offered.join(', '));
    setIsDialogOpen(true);
  };

  const handleDelete = async (company: Company) => {
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      try {
        const { error } = await supabase
          .from('companies')
          .delete()
          .eq('id', company.id);

        if (error) throw error;
        
        toast.success(`${company.name} has been deleted`);
      } catch (error) {
        console.error('Error deleting company:', error);
        toast.error('Failed to delete company');
      }
    }
  };

  const handleSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert job roles input to array
      const jobRolesArray = jobRolesInput
        .split(',')
        .map(role => role.trim())
        .filter(role => role !== '');
      
      // Make sure name is provided
      if (!formData.name) {
        toast.error('Company name is required');
        setIsSubmitting(false);
        return;
      }
      
      const companyData = {
        ...formData,
        job_roles_offered: jobRolesArray,
        name: formData.name // Ensure name is explicitly set
      };
      
      if (selectedCompany) {
        // Update
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', selectedCompany.id);
          
        if (error) throw error;
        toast.success('Company updated successfully');
      } else {
        // Create
        const { error } = await supabase
          .from('companies')
          .insert([companyData]);
          
        if (error) throw error;
        toast.success('Company added successfully');
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Failed to save company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCompany(null);
    setSelectedCompanyId(null);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {viewMode === 'list' ? (
          <>
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
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <p>Loading companies...</p>
                  </div>
                ) : (
                  <DataTable 
                    data={companies} 
                    columns={companyColumns} 
                    searchField="name"
                    onRowClick={viewCompanyDetails}
                  />
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <Button variant="outline" onClick={handleBackToList} className="mb-4">
                  Back to Companies
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{selectedCompany?.name}</h1>
                <p className="text-muted-foreground mt-1">
                  View and manage company details and interactions
                </p>
              </div>
              <div className="flex space-x-2">
                <AddInteractionDialog companyId={selectedCompanyId || ''} />
                <Button onClick={() => handleEdit(selectedCompany!)} className="hover-transition">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Company
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Company Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact Person</h3>
                      <p>{selectedCompany?.contact_person || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact Email</h3>
                      <p>{selectedCompany?.contact_email || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact Phone</h3>
                      <p>{selectedCompany?.contact_phone || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Collaboration Status</h3>
                      <div className="flex items-center">
                        <span 
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            selectedCompany?.collaboration_status === 'active' ? 'bg-green-500' : 'bg-slate-400'
                          }`}
                        />
                        {selectedCompany?.collaboration_status === 'active' ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Company Status</h3>
                      <div className="flex items-center">
                        <span 
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            selectedCompany?.company_status === 'partner' ? 'bg-green-500' :
                            selectedCompany?.company_status === 'prospect' ? 'bg-blue-500' :
                            selectedCompany?.company_status === 'former_partner' ? 'bg-amber-500' : 'bg-slate-400'
                          }`}
                        />
                        {selectedCompany?.company_status === 'partner' ? 'Partner' :
                         selectedCompany?.company_status === 'prospect' ? 'Prospect' :
                         selectedCompany?.company_status === 'former_partner' ? 'Former Partner' : 'Inactive'}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Job Roles Offered</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCompany?.job_roles_offered.map((role, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedCompanyId && (
                <InteractionsTimeline companyId={selectedCompanyId} />
              )}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Company Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{selectedCompany ? 'Edit Company' : 'Add New Company'}</DialogTitle>
            <DialogDescription>
              {selectedCompany ? 'Update company details.' : 'Enter company details to add to the system.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCompany}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Company Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    placeholder="Enter company name" 
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input 
                    id="contact_person"
                    name="contact_person"
                    value={formData.contact_person || ''}
                    onChange={handleInputChange}
                    placeholder="Enter contact person" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input 
                    id="contact_email"
                    name="contact_email" 
                    type="email"
                    value={formData.contact_email || ''}
                    onChange={handleInputChange}
                    placeholder="Enter email address" 
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input 
                    id="contact_phone"
                    name="contact_phone"
                    value={formData.contact_phone || ''}
                    onChange={handleInputChange} 
                    placeholder="Enter phone number" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="collaboration_status">Collaboration Status</Label>
                  <Select 
                    value={formData.collaboration_status || 'active'}
                    onValueChange={(value) => handleSelectChange('collaboration_status', value)}
                  >
                    <SelectTrigger id="collaboration_status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="company_status">Company Status</Label>
                  <Select 
                    value={formData.company_status || 'partner'}
                    onValueChange={(value) => handleSelectChange('company_status', value)}
                  >
                    <SelectTrigger id="company_status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="former_partner">Former Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="job_roles">Job Roles Offered</Label>
                <Textarea 
                  id="job_roles"
                  value={jobRolesInput}
                  onChange={(e) => setJobRolesInput(e.target.value)}
                  placeholder="E.g. Developer, Designer (comma separated)"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate each role with a comma
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : selectedCompany ? 'Update Company' : 'Add Company'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Companies;
