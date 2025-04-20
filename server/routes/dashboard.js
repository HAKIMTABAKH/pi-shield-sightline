
import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Count attacks blocked (all alerts)
    const { count: attacksBlocked, error: attacksError } = await supabaseAdmin
      .from('alerts')
      .select('*', { count: 'exact', head: true });
    
    if (attacksError) {
      logger.error(`Error counting attacks: ${attacksError.message}`);
      return res.status(500).json({ error: attacksError.message });
    }
    
    // Count active alerts (status is not 'resolved')
    const { count: activeAlerts, error: alertsError } = await supabaseAdmin
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .not('status', 'eq', 'resolved');
    
    if (alertsError) {
      logger.error(`Error counting active alerts: ${alertsError.message}`);
      return res.status(500).json({ error: alertsError.message });
    }
    
    // Get count of blocked IPs
    const { count: blockedIpCount, error: blockedIpError } = await supabaseAdmin
      .from('blocked_ips')
      .select('*', { count: 'exact', head: true });
    
    if (blockedIpError) {
      logger.error(`Error counting blocked IPs: ${blockedIpError.message}`);
      return res.status(500).json({ error: blockedIpError.message });
    }
    
    // Get list of recent critical alerts to determine risk level
    const { data: criticalAlerts, error: criticalError } = await supabaseAdmin
      .from('alerts')
      .select('severity')
      .eq('severity', 'critical')
      .order('timestamp', { ascending: false })
      .limit(10);
    
    if (criticalError) {
      logger.error(`Error getting critical alerts: ${criticalError.message}`);
      return res.status(500).json({ error: criticalError.message });
    }
    
    // Determine risk level based on critical alerts
    let riskLevel = 'Low';
    if (criticalAlerts && criticalAlerts.length > 5) {
      riskLevel = 'High';
    } else if (criticalAlerts && criticalAlerts.length > 2) {
      riskLevel = 'Medium';
    }
    
    // Get device count (this is a placeholder - in a real app, you'd have a devices table)
    const deviceCount = 10; // For demo purposes
    
    // Return dashboard stats
    return res.status(200).json({
      attacksBlocked: attacksBlocked || 0,
      activeAlerts: activeAlerts || 0,
      riskLevel,
      deviceCount,
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
      .select('id, sourceIp, timestamp')
      .order('timestamp', { ascending: false })
      .limit(5);
    
    if (error) {
      logger.error(`Error getting attack sources: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    
    // Transform the data into the expected format
    // In a real app, you might use a geolocation service to get the country
    const sources = data.map(item => ({
      id: item.id,
      sourceIp: item.sourceIp,
      country: getRandomCountry(), // Mock function for demo
      timestamp: new Date(item.timestamp)
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
