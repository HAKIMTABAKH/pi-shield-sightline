
import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Count all alerts in the last 24 hours
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: attacksBlocked, error: attacksError } = await supabaseAdmin
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .gte('alert_timestamp', today.toISOString());
    
    if (attacksError) {
      logger.error(`Error counting attacks: ${attacksError.message}`);
      return res.status(500).json({ error: attacksError.message });
    }
    
    // Count active alerts (status is not 'resolved' or 'ignored')
    const { count: activeAlerts, error: alertsError } = await supabaseAdmin
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .not('status', 'in', '("resolved","ignored")');
    
    if (alertsError) {
      logger.error(`Error counting active alerts: ${alertsError.message}`);
      return res.status(500).json({ error: alertsError.message });
    }
    
    // Get count of blocked IPs
    const { count: blockedIpCount, error: blockedIpError } = await supabaseAdmin
      .from('blocked_ips')
      .select('*', { count: 'exact', head: true })
      .is('expires_at', null)
      .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    if (blockedIpError) {
      logger.error(`Error counting blocked IPs: ${blockedIpError.message}`);
      return res.status(500).json({ error: blockedIpError.message });
    }
    
    // Get list of recent critical/high alerts to determine risk level
    const { data: recentAlerts, error: criticalError } = await supabaseAdmin
      .from('alerts')
      .select('severity')
      .in('severity', ['critical', 'high'])
      .gt('alert_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('alert_timestamp', { ascending: false });
    
    if (criticalError) {
      logger.error(`Error getting critical alerts: ${criticalError.message}`);
      return res.status(500).json({ error: criticalError.message });
    }
    
    // Determine risk level based on recent critical/high alerts
    let riskLevel = 'Low';
    if (recentAlerts) {
      const criticalCount = recentAlerts.filter(a => a.severity === 'critical').length;
      const highCount = recentAlerts.filter(a => a.severity === 'high').length;
      
      if (criticalCount > 2 || highCount > 5) {
        riskLevel = 'High';
      } else if (criticalCount > 0 || highCount > 2) {
        riskLevel = 'Medium';
      }
    }
    
    // Return dashboard stats
    return res.status(200).json({
      attacksBlocked: attacksBlocked || 0,
      activeAlerts: activeAlerts || 0,
      riskLevel,
      deviceCount: 10, // Placeholder - implement device tracking if needed
      blockedIpCount: blockedIpCount || 0
    });
  } catch (error) {
    logger.error(`Get dashboard stats error: ${error.message}`);
    return res.status(500).json({ error: 'Error fetching dashboard statistics' });
  }
});

// Get attack data for charts
router.get('/chart-data', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNumber = parseInt(days);
    
    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNumber);
    
    // Format dates for Supabase query
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    
    // Get attacks grouped by day
    const { data, error } = await supabaseAdmin.rpc('get_attacks_by_day', {
      start_date: startDateStr,
      end_date: endDateStr
    });
    
    if (error) {
      logger.error(`Error getting chart data: ${error.message}`);
      
      // Fallback to generate mock data if RPC fails
      const mockData = [];
      for (let i = 0; i <= daysNumber; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        mockData.unshift({
          date: formattedDate,
          attacks: Math.floor(Math.random() * 20) + 1
        });
      }
      
      return res.status(200).json(mockData);
    }
    
    // Process and format the data
    const formattedData = data.map(item => ({
      date: new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      attacks: item.count
    }));
    
    return res.status(200).json(formattedData);
  } catch (error) {
    logger.error(`Get chart data error: ${error.message}`);
    return res.status(500).json({ error: 'Error fetching chart data' });
  }
});

// Get attack map data (recent attack origins)
router.get('/attack-sources', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('alerts')
      .select('id, source_ip, alert_timestamp, severity')
      .order('alert_timestamp', { ascending: false })
      .limit(5);
    
    if (error) {
      logger.error(`Error getting attack sources: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    
    // Transform the data and add mock country data
    const sources = data.map(alert => ({
      id: alert.id,
      sourceIp: alert.source_ip,
      country: getRandomCountry(), // Mock function for demo
      timestamp: new Date(alert.alert_timestamp),
      severity: alert.severity
    }));
    
    return res.status(200).json(sources);
  } catch (error) {
    logger.error(`Get attack sources error: ${error.message}`);
    return res.status(500).json({ error: 'Error fetching attack sources' });
  }
});

// Helper function to get a random country (for demo purposes)
function getRandomCountry() {
  const countries = ['Brazil', 'Russia', 'India', 'China', 'United States', 'Ukraine', 'Netherlands'];
  return countries[Math.floor(Math.random() * countries.length)];
}

export default router;
