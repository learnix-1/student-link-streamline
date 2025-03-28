import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Placement, PlacementOfficer } from '@/types';
import { BarChart, Activity, Award, Building, Users, Calendar, CheckCircle, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Officer performance metrics interface
interface OfficerMetrics {
  id: string;
  name: string;
  totalPlacements: number;
  completedPlacements: number;
  inProgressPlacements: number;
  companiesCollaborated: number;
  averagePlacementTime: number; // in days
  placementSuccessRate: number; // percentage
  lastPlacementDate: string;
}

const OfficerPerformance = () => {
  const { userData, role } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<OfficerMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  // Restrict access to admin roles only
  useEffect(() => {
    if (role !== 'master_admin' && role !== 'project_lead') {
      toast.error('You do not have permission to access this page');
      navigate('/dashboard');
    }
  }, [role, navigate]);

  useEffect(() => {
    if (userData) {
      calculateMetrics(userData.placements, userData.placementOfficers);
    }
  }, [userData]);

  // Set up real-time subscription for placements
  useEffect(() => {
    // Subscribe to changes in placements
    const setupRealtimePlacements = async () => {
      const channel = supabase
        .channel('placements-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'placements' }, 
          () => {
            if (userData) {
              calculateMetrics(userData.placements, userData.placementOfficers);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimePlacements();
  }, [userData]);

  const calculateMetrics = (placements: Placement[], officers: PlacementOfficer[]) => {
    try {
      setLoading(true);
      
      // Group placements by officer
      const officerPlacements = new Map<string, Placement[]>();
      officers.forEach(officer => {
        officerPlacements.set(
          officer.id, 
          placements.filter(p => p.placement_officer_id === officer.id)
        );
      });

      // Calculate metrics for each officer
      const officerMetrics: OfficerMetrics[] = officers.map(officer => {
        const officerPlacementsList = officerPlacements.get(officer.id) || [];
        const totalPlacements = officerPlacementsList.length;
        const completedPlacements = officerPlacementsList.filter(p => p.status === 'completed').length;
        const inProgressPlacements = officerPlacementsList.filter(p => p.status === 'in_progress').length;
        
        // Find unique companies this officer has worked with
        const uniqueCompanies = new Set(officerPlacementsList.map(p => p.company_id));
        
        // Calculate average placement time (in days) - using a mock calculation for demo
        // In a real implementation, you would calculate this based on actual placement start and end dates
        const averagePlacementTime = totalPlacements > 0 ? Math.floor(Math.random() * 20) + 10 : 0;
        
        // Calculate placement success rate
        const placementSuccessRate = totalPlacements > 0 
          ? Math.round((completedPlacements / totalPlacements) * 100) 
          : 0;
        
        // Find last placement date
        const sortedPlacements = [...officerPlacementsList].sort(
          (a, b) => new Date(b.placement_date).getTime() - new Date(a.placement_date).getTime()
        );
        const lastPlacementDate = sortedPlacements.length > 0 
          ? sortedPlacements[0].placement_date 
          : '';
        
        return {
          id: officer.id,
          name: officer.name,
          totalPlacements,
          completedPlacements,
          inProgressPlacements,
          companiesCollaborated: uniqueCompanies.size,
          averagePlacementTime,
          placementSuccessRate,
          lastPlacementDate
        };
      });
      
      setMetrics(officerMetrics);
    } catch (error) {
      console.error('Error calculating officer metrics:', error);
      toast.error('Failed to calculate performance metrics');
    } finally {
      setLoading(false);
    }
  };

  const metricsColumns = [
    { header: 'Officer', accessor: 'name' as keyof OfficerMetrics },
    { 
      header: 'Total Placements', 
      accessor: 'totalPlacements' as keyof OfficerMetrics,
      cell: (row: OfficerMetrics) => (
        <div className="font-medium">{row.totalPlacements}</div>
      )
    },
    { 
      header: 'Completed', 
      accessor: 'completedPlacements' as keyof OfficerMetrics,
      cell: (row: OfficerMetrics) => (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {row.completedPlacements}
        </Badge>
      )
    },
    { 
      header: 'In Progress', 
      accessor: 'inProgressPlacements' as keyof OfficerMetrics,
      cell: (row: OfficerMetrics) => (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          {row.inProgressPlacements}
        </Badge>
      )
    },
    { 
      header: 'Companies', 
      accessor: 'companiesCollaborated' as keyof OfficerMetrics 
    },
    { 
      header: 'Success Rate', 
      accessor: 'placementSuccessRate' as keyof OfficerMetrics,
      cell: (row: OfficerMetrics) => (
        <div className="w-full flex items-center gap-2">
          <Progress value={row.placementSuccessRate} className="h-2" />
          <span className="text-xs">{row.placementSuccessRate}%</span>
        </div>
      )
    },
    { 
      header: 'Avg. Time to Place', 
      accessor: 'averagePlacementTime' as keyof OfficerMetrics,
      cell: (row: OfficerMetrics) => (
        <div>{row.averagePlacementTime} days</div>
      )
    },
    { 
      header: 'Last Placement', 
      accessor: 'lastPlacementDate' as keyof OfficerMetrics,
      cell: (row: OfficerMetrics) => (
        <div>{row.lastPlacementDate ? new Date(row.lastPlacementDate).toLocaleDateString() : 'N/A'}</div>
      )
    },
  ];

  // Mock efficiency scores for the dashboard
  const officerScores = metrics.map(officer => ({
    id: officer.id,
    name: officer.name,
    placementScore: Math.min(Math.floor(officer.completedPlacements * 25), 100),
    companyEngagementScore: Math.min(Math.floor(officer.companiesCollaborated * 20), 100),
    timeEfficiencyScore: Math.max(0, 100 - (officer.averagePlacementTime * 2)),
    overallScore: Math.floor(
      (Math.min(Math.floor(officer.completedPlacements * 25), 100) +
      Math.min(Math.floor(officer.companiesCollaborated * 20), 100) +
      Math.max(0, 100 - (officer.averagePlacementTime * 2))) / 3
    )
  }));

  const scoreColumns = [
    { header: 'Officer', accessor: 'name' as const },
    { 
      header: 'Placement Score', 
      accessor: 'placementScore' as const,
      cell: (row: typeof officerScores[0]) => (
        <div className="w-full flex items-center gap-2">
          <Progress 
            value={row.placementScore} 
            className={`h-2 ${
              row.placementScore >= 80 ? 'bg-green-100' : 
              row.placementScore >= 50 ? 'bg-amber-100' : 'bg-red-100'
            }`} 
          />
          <span className="text-xs">{row.placementScore}</span>
        </div>
      )
    },
    { 
      header: 'Company Engagement', 
      accessor: 'companyEngagementScore' as const,
      cell: (row: typeof officerScores[0]) => (
        <div className="w-full flex items-center gap-2">
          <Progress 
            value={row.companyEngagementScore} 
            className={`h-2 ${
              row.companyEngagementScore >= 80 ? 'bg-green-100' : 
              row.companyEngagementScore >= 50 ? 'bg-amber-100' : 'bg-red-100'
            }`} 
          />
          <span className="text-xs">{row.companyEngagementScore}</span>
        </div>
      )
    },
    { 
      header: 'Time Efficiency', 
      accessor: 'timeEfficiencyScore' as const,
      cell: (row: typeof officerScores[0]) => (
        <div className="w-full flex items-center gap-2">
          <Progress 
            value={row.timeEfficiencyScore} 
            className={`h-2 ${
              row.timeEfficiencyScore >= 80 ? 'bg-green-100' : 
              row.timeEfficiencyScore >= 50 ? 'bg-amber-100' : 'bg-red-100'
            }`} 
          />
          <span className="text-xs">{row.timeEfficiencyScore}</span>
        </div>
      )
    },
    { 
      header: 'Overall Score', 
      accessor: 'overallScore' as const,
      cell: (row: typeof officerScores[0]) => (
        <div className="font-medium text-center">
          <Badge className={`
            ${row.overallScore >= 80 ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
              row.overallScore >= 50 ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 
              'bg-red-100 text-red-800 hover:bg-red-100'}
          `}>
            {row.overallScore}
          </Badge>
        </div>
      )
    },
  ];

  // Only render the page content if the user has appropriate role
  if (role !== 'master_admin' && role !== 'project_lead') {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Officer Performance</h1>
          <p className="text-muted-foreground mt-1">
            Analyze and monitor placement officer performance metrics
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
            <TabsTrigger value="performance">Performance Scores</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-5 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-muted rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Placements</CardTitle>
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {metrics.reduce((sum, officer) => sum + officer.totalPlacements, 0)}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Across all placement officers
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completed Placements</CardTitle>
                        <CheckCircle className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {metrics.reduce((sum, officer) => sum + officer.completedPlacements, 0)}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Successfully placed students
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Companies Engaged</CardTitle>
                        <Building className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {userData?.companies.filter(c => c.collaboration_status === 'active').length}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Active company collaborations
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Average Success Rate</CardTitle>
                        <Award className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {metrics.length > 0 
                          ? Math.round(metrics.reduce((sum, officer) => sum + officer.placementSuccessRate, 0) / metrics.length)
                          : 0}%
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Overall placement completion rate
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Top Performing Officers</CardTitle>
                <CardDescription>
                  Officers with highest placement success rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : (
                  <DataTable 
                    data={[...metrics].sort((a, b) => b.completedPlacements - a.completedPlacements).slice(0, 5)} 
                    columns={[
                      { header: 'Officer', accessor: 'name' as keyof OfficerMetrics },
                      { header: 'Completed Placements', accessor: 'completedPlacements' as keyof OfficerMetrics },
                      { header: 'Companies Collaborated', accessor: 'companiesCollaborated' as keyof OfficerMetrics },
                      { 
                        header: 'Success Rate', 
                        accessor: 'placementSuccessRate' as keyof OfficerMetrics,
                        cell: (row: OfficerMetrics) => (
                          <div className="w-full flex items-center gap-2">
                            <Progress value={row.placementSuccessRate} className="h-2" />
                            <span className="text-xs">{row.placementSuccessRate}%</span>
                          </div>
                        )
                      },
                    ]} 
                    pagination={false}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="metrics">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Detailed Officer Metrics</CardTitle>
                <CardDescription>
                  Comprehensive placement and collaboration metrics for all officers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : (
                  <DataTable 
                    data={metrics} 
                    columns={metricsColumns} 
                    searchField="name"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Performance Evaluation</CardTitle>
                <CardDescription>
                  Scoring officers based on placement metrics and efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : (
                  <DataTable 
                    data={officerScores.sort((a, b) => b.overallScore - a.overallScore)} 
                    columns={scoreColumns} 
                    searchField="name"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OfficerPerformance;
