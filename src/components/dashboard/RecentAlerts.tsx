
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Types for alerts
interface Alert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  sourceIp: string;
}

// Mock data for recent alerts
const recentAlerts: Alert[] = [
  { 
    id: 'alert-001', 
    timestamp: new Date(Date.now() - 15 * 60000).toLocaleTimeString(), 
    severity: 'critical', 
    type: 'SQL Injection Attempt', 
    sourceIp: '192.168.1.105' 
  },
  { 
    id: 'alert-002', 
    timestamp: new Date(Date.now() - 47 * 60000).toLocaleTimeString(), 
    severity: 'high', 
    type: 'Brute Force Attack', 
    sourceIp: '10.0.0.23' 
  },
  { 
    id: 'alert-003', 
    timestamp: new Date(Date.now() - 124 * 60000).toLocaleTimeString(), 
    severity: 'medium', 
    type: 'Port Scan', 
    sourceIp: '172.16.4.89' 
  },
];

const RecentAlerts = () => {
  // Helper function to get styling based on severity
  const getSeverityStyle = (severity: Alert['severity']) => {
    switch(severity) {
      case 'critical':
        return {
          bg: 'bg-status-danger/10',
          text: 'text-status-danger',
          badge: 'bg-status-danger text-white'
        };
      case 'high':
        return {
          bg: 'bg-status-warning/10',
          text: 'text-status-warning',
          badge: 'bg-status-warning text-white'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-500',
          badge: 'bg-yellow-500 text-white'
        };
      case 'low':
        return {
          bg: 'bg-status-success/10',
          text: 'text-status-success',
          badge: 'bg-status-success text-white'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-500',
          badge: 'bg-gray-500 text-white'
        };
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Latest Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {recentAlerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);
            return (
              <div 
                key={alert.id} 
                className="p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <Badge className={cn(style.badge, "capitalize")}>
                    {alert.severity}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {alert.timestamp}
                  </span>
                </div>
                <div className="mb-1 font-medium truncate">
                  {alert.type}
                </div>
                <div className="text-sm text-muted-foreground">
                  Source: {alert.sourceIp}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="pt-2 px-4 pb-4">
        <Button asChild variant="outline" className="w-full">
          <Link to="/alerts">View All Alerts</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentAlerts;
