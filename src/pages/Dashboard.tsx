
import React, { useEffect, useState } from 'react';
import { ShieldCheck, Bell, AlertTriangle, Wifi } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import MetricCard from '@/components/dashboard/MetricCard';
import AttackChart from '@/components/dashboard/AttackChart';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import AttackMap from '@/components/dashboard/AttackMap';
import { dashboardService, DashboardStats } from '@/api/dashboardService';
import { websocketService } from '@/api/websocketService';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    attacksBlocked: 0,
    activeAlerts: 0,
    riskLevel: 'Medium',
    deviceCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'live' | 'demo'>('live');
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const stats = await dashboardService.getStats();
        setDashboardData(stats);
        
        if (process.env.NODE_ENV === 'development' || window.location.hostname !== 'localhost') {
          setDataSource('demo');
        } else {
          setDataSource('live');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDataSource('demo');
        toast({
          title: "Using demo data",
          description: "Could not connect to Raspberry Pi - showing simulated data instead.",
          variant: "default"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Connect to WebSocket for real-time updates
    websocketService.connect();

    // Listen for stats updates
    const handleStatsUpdate = (data: DashboardStats) => {
      setDashboardData(data);
      console.log('Dashboard stats updated via WebSocket');
    };

    // Listen for new alerts
    const handleNewAlert = (data: any) => {
      toast({
        title: `New ${data.severity} Alert`,
        description: `${data.type} from ${data.sourceIp}`,
        variant: data.severity === 'critical' ? 'destructive' : 'default'
      });
      
      // Update active alerts count
      setDashboardData(prev => ({
        ...prev,
        activeAlerts: prev.activeAlerts + 1
      }));
    };

    websocketService.on('STATS_UPDATE', handleStatsUpdate);
    websocketService.on('NEW_ALERT', handleNewAlert);

    return () => {
      // Clean up event listeners when component unmounts
      websocketService.off('STATS_UPDATE', handleStatsUpdate);
      websocketService.off('NEW_ALERT', handleNewAlert);
      // Don't disconnect here as other components might need it
    };
  }, [toast]);

  const getStatusFromAlertCount = (count: number) => {
    if (count === 0) return 'success';
    if (count < 5) return 'warning';
    return 'danger';
  };

  const getStatusFromRiskLevel = (level: string) => {
    if (level === 'Low') return 'success';
    if (level === 'Medium') return 'warning';
    return 'danger';
  };

  return (
    <MainLayout title="Dashboard">
      {dataSource === 'demo' && (
        <div className="mb-6 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-md">
          <p className="text-sm font-medium flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Demo Mode: Displaying simulated security data. No connection to Raspberry Pi required.
          </p>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Attacks Blocked (Today)"
          value={dashboardData.attacksBlocked}
          icon={<ShieldCheck className="h-6 w-6" />}
          status={getStatusFromAlertCount(dashboardData.attacksBlocked)}
        />
        <MetricCard
          title="Active Alerts"
          value={dashboardData.activeAlerts}
          icon={<Bell className="h-6 w-6" />}
          status={getStatusFromAlertCount(dashboardData.activeAlerts)}
        />
        <MetricCard
          title="Network Risk Level"
          value={dashboardData.riskLevel}
          icon={<AlertTriangle className="h-6 w-6" />}
          status={getStatusFromRiskLevel(dashboardData.riskLevel)}
        />
        <MetricCard
          title="Monitored Devices"
          value={dashboardData.deviceCount}
          icon={<Wifi className="h-6 w-6" />}
          status="success"
        />
      </div>
      
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <AttackChart />
        <RecentAlerts />
      </div>
      
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <AttackMap />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
