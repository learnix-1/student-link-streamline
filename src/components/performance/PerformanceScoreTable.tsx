
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/DataTable';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { OfficerMetrics } from '@/types';

interface PerformanceScoreTableProps {
  metrics: OfficerMetrics[];
  loading: boolean;
}

const PerformanceScoreTable: React.FC<PerformanceScoreTableProps> = ({ metrics, loading }) => {
  // Calculate performance scores
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

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Performance Evaluation</CardTitle>
          <CardDescription>
            Scoring officers based on placement metrics and efficiency
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
        <CardTitle className="text-lg font-medium">Performance Evaluation</CardTitle>
        <CardDescription>
          Scoring officers based on placement metrics and efficiency
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable 
          data={officerScores.sort((a, b) => b.overallScore - a.overallScore)} 
          columns={scoreColumns} 
          searchField="name"
        />
      </CardContent>
    </Card>
  );
};

export default PerformanceScoreTable;
