
import { useState } from 'react';
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

// Generate mock alerts data
const generateMockAlerts = (): Alert[] => {
  const alertTypes = [
    'SQL Injection Attempt',
    'Cross-Site Scripting (XSS)',
    'Port Scan',
    'Brute Force Attack',
    'DDoS Attempt',
    'Directory Traversal',
    'Command Injection',
    'Malware Communication',
    'Suspicious File Access'
  ];
  
  const alerts: Alert[] = [];
  
  // Generate 20 random alerts
  for (let i = 0; i < 20; i++) {
    const severity: Alert['severity'] = 
      i < 3 ? 'critical' : 
      i < 8 ? 'high' : 
      i < 15 ? 'medium' : 'low';
    
    const status: Alert['status'] = 
      i < 5 ? 'new' : 
      i < 12 ? 'investigating' : 'resolved';
    
    const date = new Date();
    date.setMinutes(date.getMinutes() - (i * 30)); // Each alert is 30 minutes apart
    
    alerts.push({
      id: `alert-${(1000 + i).toString()}`,
      timestamp: date.toISOString(),
      severity,
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      sourceIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      destPort: Math.floor(Math.random() * 65000) + 1,
      status,
      details: `This is a detailed description of a ${severity} ${alertTypes[Math.floor(Math.random() * alertTypes.length)]} attack. The attack was detected by PiShield's intrusion detection system and appropriate countermeasures have been applied.`
    });
  }
  
  return alerts;
};

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>(generateMockAlerts());
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Filter alerts based on search and filters
  const filteredAlerts = alerts.filter(alert => {
    // Search term filtering
    const searchMatch = 
      alert.sourceIp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Severity filtering
    const severityMatch = severityFilter === 'all' || alert.severity === severityFilter;
    
    // Status filtering
    const statusMatch = statusFilter === 'all' || alert.status === statusFilter;
    
    return searchMatch && severityMatch && statusMatch;
  });
  
  // Handle alert status change
  const handleStatusChange = (alertId: string, newStatus: Alert['status']) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, status: newStatus } : alert
    ));
  };
  
  // Handle blocking an IP
  const handleBlockIp = (sourceIp: string) => {
    console.log(`IP ${sourceIp} has been blocked`);
    // In a real app, this would call an API endpoint to block the IP
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
        alerts={filteredAlerts} 
        onStatusChange={handleStatusChange}
        onBlockIp={handleBlockIp}
      />
      
      <div className="text-sm text-muted-foreground mt-4">
        Showing {filteredAlerts.length} alerts
        {filteredAlerts.length !== alerts.length && ` (filtered from ${alerts.length})`}
      </div>
    </MainLayout>
  );
};

export default Alerts;
