
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { OfficerMetrics, Placement } from '@/types';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface MonthlyData {
  month: string;
  placements: number;
  completions: number;
  companies: number;
}

interface MonthlyPerformanceChartProps {
  metrics: OfficerMetrics[];
  loading: boolean;
  placements: Placement[];
  selectedMonth: number | null;
  selectedYear: number;
  selectedOfficer: string | null;
}

const MonthlyPerformanceChart: React.FC<MonthlyPerformanceChartProps> = ({ 
  metrics, 
  loading, 
  placements,
  selectedMonth,
  selectedYear,
  selectedOfficer
}) => {
  // Generate monthly data from real placements
  const generateMonthlyData = (): MonthlyData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Filter by year
    const yearPlacements = placements.filter(p => {
      const date = new Date(p.placement_date);
      return date.getFullYear() === selectedYear;
    });
    
    // Filter by officer if selected
    const officerPlacements = selectedOfficer 
      ? yearPlacements.filter(p => p.placement_officer_id === selectedOfficer)
      : yearPlacements;
    
    // If month is selected, only include that month
    const monthsToInclude = selectedMonth !== null 
      ? [selectedMonth]
      : Array.from({ length: 12 }, (_, i) => i);
    
    return monthsToInclude.map(monthIndex => {
      const monthPlacements = officerPlacements.filter(p => {
        const date = new Date(p.placement_date);
        return date.getMonth() === monthIndex;
      });
      
      // Calculate unique companies for this month
      const uniqueCompanies = new Set(monthPlacements.map(p => p.company_id));
      
      return {
        month: months[monthIndex],
        placements: monthPlacements.length,
        completions: monthPlacements.filter(p => p.status === 'completed').length,
        companies: uniqueCompanies.size
      };
    });
  };

  const monthlyData = generateMonthlyData();

  const chartConfig = {
    placements: { color: '#4f46e5' },
    completions: { color: '#10b981' },
    companies: { color: '#f59e0b' }
  };

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Monthly Performance</CardTitle>
          <CardDescription>
            Placement activity trends by month
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <div className="animate-pulse h-full bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          {selectedMonth !== null 
            ? `Performance for ${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })} ${selectedYear}`
            : `Monthly Performance for ${selectedYear}`}
          {selectedOfficer && metrics.find(m => m.id === selectedOfficer)
            ? ` - ${metrics.find(m => m.id === selectedOfficer)?.name}`
            : ''}
        </CardTitle>
        <CardDescription>
          Placement activity trends by month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart
              data={monthlyData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="placements" name="Total Placements" fill="#4f46e5" />
              <Bar dataKey="completions" name="Completed Placements" fill="#10b981" />
              <Bar dataKey="companies" name="Companies Collaborated" fill="#f59e0b" />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyPerformanceChart;
