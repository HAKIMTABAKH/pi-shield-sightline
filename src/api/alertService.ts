
import { API_ENDPOINTS, getRequestOptions } from './config';
import { authService } from './authService';

export interface Alert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  sourceIp: string;
  destPort?: number;
  status: 'new' | 'investigating' | 'resolved';
  details?: string;
}

export const alertService = {
  async getAlerts(filters?: {
    severity?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Alert[]> {
    try {
      // For demo, return mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Getting alerts with filters:', filters);
        return getMockAlerts(filters);
      }
      
      // Construct query params
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      // Make API request
      const url = `${API_ENDPOINTS.alerts.getAll}?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        ...getRequestOptions(authService.getToken()),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },
  
  async updateAlertStatus(alertId: string, newStatus: Alert['status']): Promise<Alert> {
    try {
      // For demo, simulate success in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Updating alert ${alertId} to status ${newStatus}`);
        return {
          id: alertId,
          timestamp: new Date().toISOString(),
          severity: 'high',
          type: 'Mock Alert',
          sourceIp: '192.168.1.1',
          status: newStatus,
        };
      }
      
      // Make API request
      const url = API_ENDPOINTS.alerts.updateStatus(alertId);
      const response = await fetch(url, {
        method: 'PUT',
        ...getRequestOptions(authService.getToken()),
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update alert status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating alert status:', error);
      throw error;
    }
  },
  
  async blockIp(sourceIp: string): Promise<{ success: boolean; message: string }> {
    try {
      // For demo, simulate success in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Blocking IP: ${sourceIp}`);
        return {
          success: true,
          message: `IP ${sourceIp} has been blocked successfully`,
        };
      }
      
      // Make API request
      const response = await fetch(API_ENDPOINTS.actions.blockIp, {
        method: 'POST',
        ...getRequestOptions(authService.getToken()),
        body: JSON.stringify({ ip: sourceIp }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to block IP');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error blocking IP:', error);
      throw error;
    }
  }
};

// Mock data generator for development
function getMockAlerts(filters?: any): Alert[] {
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
  
  const mockAlerts: Alert[] = [];
  
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
    date.setMinutes(date.getMinutes() - (i * 30));
    
    mockAlerts.push({
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
  
  // Apply filters if provided
  let filteredAlerts = [...mockAlerts];
  
  if (filters) {
    if (filters.severity && filters.severity !== 'all') {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === filters.severity);
    }
    
    if (filters.status && filters.status !== 'all') {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === filters.status);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.sourceIp.toLowerCase().includes(searchTerm) ||
        alert.type.toLowerCase().includes(searchTerm) ||
        alert.id.toLowerCase().includes(searchTerm)
      );
    }
  }
  
  return filteredAlerts;
}
