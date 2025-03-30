
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlacementOfficer } from '@/types';
import { RotateCcw } from 'lucide-react';

interface FilterControlsProps {
  selectedMonth: number | null;
  setSelectedMonth: (month: number | null) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedOfficer: string | null;
  setSelectedOfficer: (officerId: string | null) => void;
  officers: PlacementOfficer[];
  loading: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  selectedOfficer,
  setSelectedOfficer,
  officers,
  loading
}) => {
  const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ];

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const resetFilters = () => {
    setSelectedMonth(null);
    setSelectedYear(currentYear);
    setSelectedOfficer(null);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-40">
              <Select
                value={selectedMonth !== null ? selectedMonth.toString() : "all"}
                onValueChange={(value) => setSelectedMonth(value === "all" ? null : parseInt(value))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-32">
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-60">
              <Select
                value={selectedOfficer || "all"}
                onValueChange={(value) => setSelectedOfficer(value === "all" ? null : value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Placement Officer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Officers</SelectItem>
                  {officers.map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={resetFilters}
            size="icon"
            title="Reset filters"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterControls;
