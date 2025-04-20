
import { API_ENDPOINTS, getRequestOptions } from './config';
import { authService } from './authService';

export interface DashboardStats {
  attacksBlocked: number;
  activeAlerts: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  deviceCount: number;
}

export interface AttackSource {
  id: string;
  sourceIp: string;
  country: string;
  timestamp: Date;
}

export interface ChartDataPoint {
  date: string;
  attacks: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      // For demo, return mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Getting dashboard stats');
        return {
          attacksBlocked: Math.floor(Math.random() * 50) + 10,
          activeAlerts: Math.floor(Math.random() * 10),
          riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
          deviceCount: Math.floor(Math.random() * 20) + 5
        };
      }
      
      // Make API request
      const response = await fetch(API_ENDPOINTS.dashboard.stats, {
        method: 'GET',
        ...getRequestOptions(authService.getToken()),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
  
  async getAttackSources(): Promise<AttackSource[]> {
    // In a real app, this would fetch from the API
    // For now, returning mock data
    const countries = ['Brazil', 'Russia', 'India', 'China', 'United States', 'Ukraine', 'Netherlands'];
    
    return [
      { 
        id: 'attack-1', 
        sourceIp: '203.0.113.42', 
        country: 'China', 
        timestamp: new Date(Date.now() - 45000) 
      },
      { 
        id: 'attack-2', 
        sourceIp: '198.51.100.22', 
        country: 'Russia', 
        timestamp: new Date(Date.now() - 120000) 
      },
      { 
        id: 'attack-3', 
        sourceIp: '192.0.2.89', 
        country: 'United States', 
        timestamp: new Date(Date.now() - 300000) 
      }
    ];
  },
  
  getChartData(days: number): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // Generate random attack counts, weighted for more recent days to show a pattern
      let attackCount;
      if (i < 2) {
        // Most recent days have higher counts
        attackCount = Math.floor(Math.random() * 20) + 5;
      } else if (i < 4) {
        // Medium recent days have medium counts
        attackCount = Math.floor(Math.random() * 15) + 3;
      } else {
        // Older days have lower counts
        attackCount = Math.floor(Math.random() * 10) + 1;
      }
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        attacks: attackCount
      });
    }
    
    return data;
  }
};
