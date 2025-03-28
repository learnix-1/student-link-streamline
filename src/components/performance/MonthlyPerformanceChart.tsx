
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { OfficerMetrics } from '@/types';

interface MonthlyData {
  month: string;
  placements: number;
  completions: number;
}

interface MonthlyPerformanceChartProps {
  metrics: OfficerMetrics[];
  loading: boolean;
}

const MonthlyPerformanceChart: React.FC<MonthlyPerformanceChartProps> = ({ metrics, loading }) => {
  // Generate monthly data (mock data for demonstration)
  const generateMonthlyData = (): MonthlyData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      // For demonstration, we'll generate some data based on the metrics
      // In a real implementation, this would come from actual date-filtered data
      const totalOfficers = metrics.length;
      const factor = (index + 1) / (currentMonth + 1); // Higher for recent months
      
      return {
        month,
        placements: Math.floor(Math.random() * 10 * totalOfficers * factor) + 5,
        completions: Math.floor(Math.random() * 8 * totalOfficers * factor)
      };
    });
  };

  const monthlyData = generateMonthlyData();

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
        <CardTitle className="text-lg font-medium">Monthly Performance</CardTitle>
        <CardDescription>
          Placement activity trends by month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
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
              <Tooltip />
              <Legend />
              <Bar dataKey="placements" name="Total Placements" fill="#4f46e5" />
              <Bar dataKey="completions" name="Completed Placements" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyPerformanceChart;
