
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  className,
}) => {
  return (
    <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
};

export default StatCard;
