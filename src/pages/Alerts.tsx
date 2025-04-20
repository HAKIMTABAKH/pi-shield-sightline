
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import AlertsTable, { Alert } from '@/components/alerts/AlertsTable';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { alertService } from '@/api/alertService';
import { useToast } from '@/hooks/use-toast';
import { websocketService } from '@/api/websocketService';

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Function to load alerts with current filters
  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (severityFilter !== 'all') filters.severity = severityFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (searchTerm) filters.search = searchTerm;
      
      const fetchedAlerts = await alertService.getAlerts(filters);
      setAlerts(fetchedAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: "Failed to load alerts",
        description: "Could not retrieve alert data from the server.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial load and when filters change
  useEffect(() => {
    loadAlerts();
  }, [severityFilter, statusFilter, searchTerm]);
  
  // Setup WebSocket for real-time updates
  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Listen for new alerts
    const handleNewAlert = (data: Alert) => {
      toast({
        title: `New ${data.severity} Alert`,
        description: `${data.type} from ${data.sourceIp}`,
        variant: data.severity === 'critical' ? 'destructive' : 'default'
      });
      
      // Add to alerts list if it matches current filters
      const matchesFilter = 
        (severityFilter === 'all' || data.severity === severityFilter) &&
        (statusFilter === 'all' || data.status === statusFilter) &&
        (!searchTerm || 
          data.sourceIp.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.type.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (matchesFilter) {
        setAlerts(prev => [data, ...prev]);
      }
    };

    // Listen for alert status updates
    const handleAlertUpdate = (data: { id: string; status: Alert['status'] }) => {
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === data.id 
            ? { ...alert, status: data.status } 
            : alert
        )
      );
    };

    websocketService.on('NEW_ALERT', handleNewAlert);
    websocketService.on('ALERT_UPDATE', handleAlertUpdate);

    return () => {
      // Clean up event listeners
      websocketService.off('NEW_ALERT', handleNewAlert);
      websocketService.off('ALERT_UPDATE', handleAlertUpdate);
    };
  }, [toast, severityFilter, statusFilter, searchTerm]);
  
  // Handle alert status change
  const handleStatusChange = async (alertId: string, newStatus: Alert['status']) => {
    try {
      await alertService.updateAlertStatus(alertId, newStatus);
      
      // Update local state
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, status: newStatus } : alert
      ));
      
      toast({
        title: "Alert status updated",
        description: `Alert ${alertId} is now ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating alert status:', error);
      toast({
        title: "Failed to update status",
        description: "There was an error updating the alert status.",
        variant: "destructive"
      });
    }
  };
  
  // Handle blocking an IP
  const handleBlockIp = async (sourceIp: string) => {
    try {
      const result = await alertService.blockIp(sourceIp);
      
      toast({
        title: "IP Blocked",
        description: result.message || `IP ${sourceIp} has been blocked.`,
      });
    } catch (error) {
      console.error('Error blocking IP:', error);
      toast({
        title: "Failed to block IP",
        description: "There was an error blocking the IP address.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <MainLayout title="Alerts">
      <div className="flex items-center pb-4 gap-2">
        <Bell className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-medium">Security Alerts</h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="md:w-1/3">
          <Input
            placeholder="Search by IP or attack type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="md:w-1/3">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="md:w-1/3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <AlertsTable 
        alerts={alerts} 
        onStatusChange={handleStatusChange}
        onBlockIp={handleBlockIp}
        isLoading={isLoading}
      />
      
      <div className="text-sm text-muted-foreground mt-4">
        Showing {alerts.length} alerts
      </div>
    </MainLayout>
  );
};

export default Alerts;
