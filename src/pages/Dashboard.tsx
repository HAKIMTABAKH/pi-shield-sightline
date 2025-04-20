
import React from 'react';
import { ShieldCheck, Bell, ExclamationTriangle, Wifi } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import MetricCard from '@/components/dashboard/MetricCard';
import AttackChart from '@/components/dashboard/AttackChart';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import AttackMap from '@/components/dashboard/AttackMap';

const Dashboard = () => {
  // In a real app, this would fetch data from the backend
  const dashboardData = {
    attacksBlocked: 42,
    activeAlerts: 3,
    riskLevel: 'Medium',
    deviceCount: 18
  };

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
          icon={<ExclamationTriangle className="h-6 w-6" />}
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
