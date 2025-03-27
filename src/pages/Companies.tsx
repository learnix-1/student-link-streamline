
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { DataTable } from '@/components/ui/DataTable';
import { Company } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import InteractionsTimeline from '@/components/companies/InteractionsTimeline';

const Companies = () => {
  const { userData } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*');
      
      if (error) throw error;
      
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };
  
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

  const handleAdd = () => {
    setIsDialogOpen(true);
    // Reset form state for a new company
  };

  const handleEdit = (company: Company) => {
    // Set form state with company data
    toast.success('This is a demo. Company editing would be implemented here.');
  };

  const handleDelete = (company: Company) => {
    toast.success('This is a demo. Company deletion would be implemented here.');
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
              <Button onClick={() => handleEdit(selectedCompany!)} className="hover-transition">
                <Edit className="mr-2 h-4 w-4" />
                Edit Company
              </Button>
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

              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Company Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Relationship Status</h3>
                      <p className="text-2xl font-bold mt-1">{selectedCompany?.collaboration_status === 'active' ? 'Active Partner' : 'Inactive'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Available Positions</h3>
                      <p className="text-2xl font-bold mt-1">{selectedCompany?.job_roles_offered.length || 0}</p>
                    </div>
                    {/* This would be fetched from the placements table in a real implementation */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Students Placed</h3>
                      <p className="text-2xl font-bold mt-1">--</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add the Interactions Timeline component */}
            {selectedCompanyId && (
              <InteractionsTimeline companyId={selectedCompanyId} />
            )}
          </>
        )}
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
