
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, CheckCircle, BarChart } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Placement } from '@/types';

const Dashboard = () => {
  const { userData } = useAuth();
  
  if (!userData) return null;
  
  const { stats, placements } = userData;

  const placementColumns = [
    { header: 'Student', accessor: 'student_name' },
    { header: 'Company', accessor: 'company_name' },
    { header: 'Date', accessor: (row: Placement) => new Date(row.placement_date).toLocaleDateString() },
    { 
      header: 'Status', 
      accessor: 'status',
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
    { header: 'Placement Officer', accessor: 'placement_officer_name' },
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Recent Placements</CardTitle>
            <CardDescription>Latest student placement activities</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={stats.recentPlacements} 
              columns={placementColumns} 
              pagination={false}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
