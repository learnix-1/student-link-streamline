
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/DataTable';
import { Progress } from '@/components/ui/progress';
import { OfficerMetrics } from '@/types';

interface TopOfficersTableProps {
  metrics: OfficerMetrics[];
  loading: boolean;
}

const TopOfficersTable: React.FC<TopOfficersTableProps> = ({ metrics, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Top Performing Officers</CardTitle>
          <CardDescription>
            Officers with highest placement success rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Top Performing Officers</CardTitle>
        <CardDescription>
          Officers with highest placement success rates
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default TopOfficersTable;
