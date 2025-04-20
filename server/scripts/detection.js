
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { broadcastNewAlert, broadcastStatsUpdate } from '../services/websocket.js';

// Simulates detection of security events and inserts them into Supabase
export async function startDetectionSimulation(intervalSeconds = 60) {
  logger.info(`Starting detection simulation with interval of ${intervalSeconds} seconds`);
  
  // Run detection simulation at the specified interval
  return setInterval(async () => {
    try {
      // Random chance to generate an alert (30% chance)
      if (Math.random() < 0.3) {
        await generateRandomAlert();
      }
    } catch (error) {
      logger.error(`Error in detection simulation: ${error.message}`);
    }
  }, intervalSeconds * 1000);
}

// Generate a random alert and insert it into Supabase
async function generateRandomAlert() {
  try {
    // Generate random alert data
    const alert = {
      severity: getRandomSeverity(),
      type: getRandomAttackType(),
      sourceIp: getRandomIp(),
      destPort: Math.floor(Math.random() * 65535),
      status: 'new',
      details: 'Auto-generated alert by detection simulation'
    };
    
    logger.info(`Generating random alert: ${JSON.stringify(alert)}`);
    
    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from('alerts')
      .insert([alert])
      .select()
      .single();
    
    if (error) {
      logger.error(`Error inserting alert into Supabase: ${error.message}`);
      return;
    }
    
    logger.info(`Alert inserted with ID: ${data.id}`);
    
    // Broadcast via WebSocket
    broadcastNewAlert(data);
    
    // Update dashboard stats
    await updateAndBroadcastStats();
    
    return data;
  } catch (error) {
    logger.error(`Error generating random alert: ${error.message}`);
    throw error;
  }
}

// Update dashboard stats and broadcast the update
async function updateAndBroadcastStats() {
  try {
    // Count attacks blocked (all alerts)
    const { count: attacksBlocked, error: attacksError } = await supabaseAdmin
      .from('alerts')
      .select('*', { count: 'exact', head: true });
    
    if (attacksError) {
      logger.error(`Error counting attacks: ${attacksError.message}`);
      return;
    }
    
    // Count active alerts (status is not 'resolved')
    const { count: activeAlerts, error: alertsError } = await supabaseAdmin
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .not('status', 'eq', 'resolved');
    
    if (alertsError) {
      logger.error(`Error counting active alerts: ${alertsError.message}`);
      return;
    }
    
    // Get count of blocked IPs
    const { count: blockedIpCount, error: blockedIpError } = await supabaseAdmin
      .from('blocked_ips')
      .select('*', { count: 'exact', head: true });
    
    if (blockedIpError) {
      logger.error(`Error counting blocked IPs: ${blockedIpError.message}`);
      return;
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
      return;
    }
    
    // Determine risk level based on critical alerts
    let riskLevel = 'Low';
    if (criticalAlerts && criticalAlerts.length > 5) {
      riskLevel = 'High';
    } else if (criticalAlerts && criticalAlerts.length > 2) {
      riskLevel = 'Medium';
    }
    
    // Get device count (this is a placeholder - in a real app, you'd have a devices table)
    const deviceCount = 10;
    
    // Create stats object
    const stats = {
      attacksBlocked: attacksBlocked || 0,
      activeAlerts: activeAlerts || 0,
      riskLevel,
      deviceCount,
      blockedIpCount: blockedIpCount || 0
    };
    
    // Broadcast the updated stats
    broadcastStatsUpdate(stats);
    
    return stats;
  } catch (error) {
    logger.error(`Error updating stats: ${error.message}`);
    throw error;
  }
}

// Helper functions for generating random data
function getRandomSeverity() {
  const severities = ['critical', 'high', 'medium', 'low'];
  const weights = [1, 3, 5, 10]; // Critical is rarer than low
  
  return weightedRandom(severities, weights);
}

function getRandomAttackType() {
  const types = [
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
  
  return types[Math.floor(Math.random() * types.length)];
}

function getRandomIp() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function weightedRandom(items, weights) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    if (random < weights[i]) {
      return items[i];
    }
    random -= weights[i];
  }
  
  return items[items.length - 1];
}

// Export function to start the simulation
export function initializeDetection() {
  if (process.env.NODE_ENV === 'production') {
    // In production, you would set up real detection here
    logger.info('Starting real detection system');
    // Implementation would depend on your specific detection methods
  } else {
    // In development, use the simulation
    logger.info('Starting simulated detection system');
    startDetectionSimulation(30); // Generate alerts every 30 seconds
  }
}
