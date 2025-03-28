
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { OfficerMetrics } from '@/types';

interface MetricsTableProps {
  metrics: OfficerMetrics[];
  loading: boolean;
}

const MetricsTable: React.FC<MetricsTableProps> = ({ metrics, loading }) => {
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

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Detailed Officer Metrics</CardTitle>
          <CardDescription>
            Comprehensive placement and collaboration metrics for all officers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array(5).fill(0).map((_, i) => (
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
        <CardTitle className="text-lg font-medium">Detailed Officer Metrics</CardTitle>
        <CardDescription>
          Comprehensive placement and collaboration metrics for all officers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable 
          data={metrics} 
          columns={metricsColumns} 
          searchField="name"
        />
      </CardContent>
    </Card>
  );
};

export default MetricsTable;
