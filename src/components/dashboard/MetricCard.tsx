
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  status?: 'success' | 'warning' | 'danger';
  className?: string;
}

const MetricCard = ({ title, value, icon, status = 'success', className }: MetricCardProps) => {
  return (
    <Card className={cn("status-card overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-3xl font-bold">{value}</h3>
          </div>
          <div className={cn(
            "rounded-full p-2",
            status === 'success' && "bg-status-success/10 text-status-success",
            status === 'warning' && "bg-status-warning/10 text-status-warning",
            status === 'danger' && "bg-status-danger/10 text-status-danger"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
      <div className={cn(
        "h-1 w-full",
        status === 'success' && "bg-status-success",
        status === 'warning' && "bg-status-warning",
        status === 'danger' && "bg-status-danger"
      )} />
    </Card>
  );
};

export default MetricCard;
