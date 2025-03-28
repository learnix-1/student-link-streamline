
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useOfficerMetrics } from '@/hooks/use-officer-metrics';

// Import refactored components
import OverviewCards from '@/components/performance/OverviewCards';
import TopOfficersTable from '@/components/performance/TopOfficersTable';
import MetricsTable from '@/components/performance/MetricsTable';
import PerformanceScoreTable from '@/components/performance/PerformanceScoreTable';
import MonthlyPerformanceChart from '@/components/performance/MonthlyPerformanceChart';

const OfficerPerformance = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { metrics, loading, companies } = useOfficerMetrics();

  // Restrict access to admin roles only
  useEffect(() => {
    if (role !== 'master_admin' && role !== 'project_lead') {
      toast.error('You do not have permission to access this page');
      navigate('/dashboard');
    }
  }, [role, navigate]);

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
            <TabsTrigger value="monthly">Monthly Analysis</TabsTrigger>
            <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
            <TabsTrigger value="performance">Performance Scores</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <OverviewCards 
              metrics={metrics} 
              companies={companies} 
              loading={loading} 
            />
            
            <TopOfficersTable 
              metrics={metrics} 
              loading={loading} 
            />
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-6">
            <MonthlyPerformanceChart 
              metrics={metrics} 
              loading={loading} 
            />
          </TabsContent>
          
          <TabsContent value="metrics">
            <MetricsTable 
              metrics={metrics} 
              loading={loading} 
            />
          </TabsContent>
          
          <TabsContent value="performance">
            <PerformanceScoreTable 
              metrics={metrics} 
              loading={loading} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OfficerPerformance;
