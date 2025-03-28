
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, Building, Award } from 'lucide-react';
import { OfficerMetrics } from '@/types';

interface OverviewCardsProps {
  metrics: OfficerMetrics[];
  companies: { collaboration_status: string }[];
  loading: boolean;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ metrics, companies, loading }) => {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
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
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            {companies.filter(c => c.collaboration_status === 'active').length}
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
    </div>
  );
};

export default OverviewCards;
