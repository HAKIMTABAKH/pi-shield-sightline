
import { useState } from 'react';
import { 
  Eye, 
  Hand, 
  Check, 
  ChevronUp, 
  ChevronDown, 
  AlertTriangle, 
  AlertCircle, 
  AlertOctagon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Types
export interface Alert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  sourceIp: string;
  destPort: number;
  status: 'new' | 'investigating' | 'resolved';
  details?: string;
}

interface AlertsTableProps {
  alerts: Alert[];
  onStatusChange: (alertId: string, newStatus: Alert['status']) => void;
  onBlockIp: (sourceIp: string) => void;
}

const AlertsTable = ({ alerts, onStatusChange, onBlockIp }: AlertsTableProps) => {
  const [sortField, setSortField] = useState<keyof Alert>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const { toast } = useToast();

  // Sort alerts
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (sortField === 'timestamp') {
      // Parse timestamps and sort by date
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      // Sort by string comparisons for other fields
      const valA = String(a[sortField]).toLowerCase();
      const valB = String(b[sortField]).toLowerCase();
      return sortDirection === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    }
  });

  // Handle sort change
  const handleSort = (field: keyof Alert) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // View alert details
  const handleViewDetails = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  // Handle status changes
  const handleMarkResolved = (alertId: string) => {
    onStatusChange(alertId, 'resolved');
    toast({
      title: "Alert updated",
      description: "Alert has been marked as resolved.",
    });
  };

  const handleInvestigate = (alertId: string) => {
    onStatusChange(alertId, 'investigating');
    toast({
      title: "Alert status changed",
      description: "Alert has been marked for investigation.",
    });
  };

  // Handle block IP
  const handleBlockIp = (sourceIp: string) => {
    onBlockIp(sourceIp);
    toast({
      title: "IP Blocked",
      description: `${sourceIp} has been added to the blocklist.`,
      variant: "destructive"
    });
  };

  // Helper function to get severity icon
  const getSeverityIcon = (severity: Alert['severity']) => {
    switch(severity) {
      case 'critical':
        return <AlertOctagon className="h-5 w-5 text-status-danger" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-status-warning" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="h-5 w-5 text-status-success" />;
    }
  };

  // Helper function to get status badge style
  const getStatusBadge = (status: Alert['status']) => {
    switch(status) {
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'investigating':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Investigating</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-status-success/10 text-status-success border-status-success/20">Resolved</Badge>;
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Severity</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('timestamp')}>
                <div className="flex items-center">
                  Timestamp
                  {sortField === 'timestamp' && (
                    sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                <div className="flex items-center">
                  Type
                  {sortField === 'type' && (
                    sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Source IP</TableHead>
              <TableHead>Port</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAlerts.map((alert) => (
              <TableRow 
                key={alert.id} 
                className={cn(
                  "hover:bg-muted/50",
                  alert.status === 'new' && "bg-status-danger/5",
                  alert.status === 'investigating' && "bg-blue-50"
                )}
              >
                <TableCell>
                  <div className="flex items-center">
                    {getSeverityIcon(alert.severity)}
                    <span className="sr-only">{alert.severity}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {new Date(alert.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{alert.type}</TableCell>
                <TableCell>{alert.sourceIp}</TableCell>
                <TableCell>{alert.destPort}</TableCell>
                <TableCell>{getStatusBadge(alert.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(alert)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {alert.status !== 'resolved' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleBlockIp(alert.sourceIp)}
                        title="Block IP"
                      >
                        <Hand className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {alert.status === 'new' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleInvestigate(alert.id)}
                        title="Mark as Investigating"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {alert.status !== 'resolved' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkResolved(alert.id)}
                        title="Mark as Resolved"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {alerts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No alerts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Alert Details Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Alert Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this security alert
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alert ID</p>
                  <p>{selectedAlert.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                  <p>{new Date(selectedAlert.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Severity</p>
                  <p className="flex items-center gap-1">
                    {getSeverityIcon(selectedAlert.severity)}
                    <span className="capitalize">{selectedAlert.severity}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div>{getStatusBadge(selectedAlert.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Source IP</p>
                  <p>{selectedAlert.sourceIp}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Destination Port</p>
                  <p>{selectedAlert.destPort}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attack Description</p>
                <p className="mt-1">
                  {selectedAlert.details || 
                    "A detailed description of the attack, including the specific rule triggered, packet information, and potential impact."}
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium text-muted-foreground mb-2">Raw Packet Data (Sample)</p>
                <pre className="text-xs overflow-auto">
                  {`00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F
00000000: 45 00 00 3C 7C 43 40 00 80 06 00 00 C0 A8 0A 0A
00000010: C0 A8 32 01 FC 98 00 50 C5 7D 5A DF 00 00 00 00
00000020: A0 02 FA F0 AD 86 00 00 02 04 05 B4 04 02 08 0A
00000030: 09 C5 D5 98 00 00 00 00 01 03 03 07`}
                </pre>
              </div>
              
              <div className="flex justify-end gap-2">
                {selectedAlert.status !== 'resolved' && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleBlockIp(selectedAlert.sourceIp);
                      setSelectedAlert(null);
                    }}
                  >
                    <Hand className="mr-2 h-4 w-4" />
                    Block IP
                  </Button>
                )}
                
                {selectedAlert.status !== 'resolved' && (
                  <Button
                    onClick={() => {
                      handleMarkResolved(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Resolved
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertsTable;
