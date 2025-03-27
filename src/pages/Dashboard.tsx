
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, CheckCircle, BarChart } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { DashboardStats, Placement, Student, Company } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Dashboard = () => {
  const { userData } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    placedStudents: 0,
    activeCompanies: 0,
    placementRate: 0,
    recentPlacements: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch stats and set up real-time subscriptions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch students
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('*');

        if (studentsError) throw studentsError;

        // Fetch companies
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('*');

        if (companiesError) throw companiesError;

        // Fetch recent placements with related data
        const { data: placements, error: placementsError } = await supabase
          .from('placements')
          .select(`
            id,
            status,
            placement_date,
            students!placements_student_id_fkey (id, name),
            companies!placements_company_id_fkey (id, name),
            placement_officers!placements_placement_officer_id_fkey (id, name)
          `)
          .order('placement_date', { ascending: false })
          .limit(5);

        if (placementsError) throw placementsError;

        // Format placements data
        const formattedPlacements = placements.map(placement => ({
          id: placement.id,
          student_id: placement.students?.id || '',
          student_name: placement.students?.name || 'Unknown Student',
          company_id: placement.companies?.id || '',
          company_name: placement.companies?.name || 'Unknown Company',
          placement_officer_id: placement.placement_officers?.id || '',
          placement_officer_name: placement.placement_officers?.name || 'Unknown Officer',
          placement_date: placement.placement_date,
          status: placement.status,
        }));

        // Calculate stats
        const placedStudents = students ? students.filter(student => student.placement_status === 'placed').length : 0;
        const totalStudents = students ? students.length : 0;
        const activeCompanies = companies ? companies.filter(company => company.collaboration_status === 'active').length : 0;
        const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

        // Update stats
        setStats({
          totalStudents,
          placedStudents,
          activeCompanies,
          placementRate,
          recentPlacements: formattedPlacements,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time listeners
    const studentsChannel = supabase
      .channel('students-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'students' }, 
        () => {
          console.log('Students table changed, refreshing data...');
          fetchData();
        }
      )
      .subscribe();

    const companiesChannel = supabase
      .channel('companies-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'companies' }, 
        () => {
          console.log('Companies table changed, refreshing data...');
          fetchData();
        }
      )
      .subscribe();

    const placementsChannel = supabase
      .channel('placements-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'placements' }, 
        () => {
          console.log('Placements table changed, refreshing data...');
          fetchData();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(studentsChannel);
      supabase.removeChannel(companiesChannel);
      supabase.removeChannel(placementsChannel);
    };
  }, []);

  const placementColumns = [
    { header: 'Student', accessor: 'student_name' as keyof Placement },
    { header: 'Company', accessor: 'company_name' as keyof Placement },
    { header: 'Date', accessor: (row: Placement) => new Date(row.placement_date).toLocaleDateString() },
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
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of placement activities and statistics
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-5 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Students" 
              value={stats.totalStudents} 
              icon={Users}
              description="Number of registered students"
            />
            <StatCard 
              title="Placed Students" 
              value={stats.placedStudents} 
              icon={CheckCircle}
              description="Successfully placed students"
            />
            <StatCard 
              title="Active Companies" 
              value={stats.activeCompanies} 
              icon={Briefcase}
              description="Collaborating companies"
            />
            <StatCard 
              title="Placement Rate" 
              value={`${stats.placementRate}%`} 
              icon={BarChart}
              description="Overall placement success rate"
            />
          </div>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Recent Placements</CardTitle>
            <CardDescription>Latest student placement activities</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded"></div>
                ))}
              </div>
            ) : (
              <DataTable 
                data={stats.recentPlacements} 
                columns={placementColumns} 
                pagination={false}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
